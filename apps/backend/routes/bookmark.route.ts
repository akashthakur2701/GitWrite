import type { Env } from "../type/env";
import { Hono } from "hono";
import { getPrisma } from "../clients/prismaClient";
import type { Context } from "hono";
import { authMiddleware } from "../middleware/auth.middleware";

const bookmarkRouter = new Hono<{
  Bindings: Env,
  Variables: {
    userId: string 
  }
}>();

type AppContext = Context<{
  Bindings: Env;
  Variables: {
    userId: string;
  };
}>;

// Apply auth middleware to all routes
bookmarkRouter.use('/*', authMiddleware);

// Toggle bookmark on a post
bookmarkRouter.post('/:postId', async (c: AppContext) => {
  try {
    const prisma = getPrisma(c);
    const postId = c.req.param('postId');
    const userId = c.get('userId');
    
    // Validate post ID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!postId || !uuidRegex.test(postId)) {
      c.status(400);
      return c.json({
        success: false,
        message: "Invalid post ID format",
        error: "INVALID_POST_ID"
      });
    }

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, published: true }
    });

    if (!post || !post.published) {
      c.status(404);
      return c.json({
        success: false,
        message: "Post not found or not published",
        error: "POST_NOT_FOUND"
      });
    }

    // Check if user already bookmarked this post
    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_postId: {
          userId,
          postId
        }
      }
    });

    let isBookmarked = false;
    let bookmarksCount = 0;

    if (existingBookmark) {
      // Remove bookmark
      await prisma.$transaction([
        prisma.bookmark.delete({
          where: { id: existingBookmark.id }
        }),
        prisma.post.update({
          where: { id: postId },
          data: { bookmarksCount: { decrement: 1 } }
        })
      ]);
      isBookmarked = false;
    } else {
      // Add bookmark
      await prisma.$transaction([
        prisma.bookmark.create({
          data: {
            userId,
            postId
          }
        }),
        prisma.post.update({
          where: { id: postId },
          data: { bookmarksCount: { increment: 1 } }
        })
      ]);
      isBookmarked = true;
    }

    // Get updated bookmarks count
    const updatedPost = await prisma.post.findUnique({
      where: { id: postId },
      select: { bookmarksCount: true }
    });
    
    bookmarksCount = updatedPost?.bookmarksCount || 0;

    return c.json({
      success: true,
      message: isBookmarked ? "Post bookmarked successfully" : "Post removed from bookmarks",
      data: {
        isBookmarked,
        bookmarksCount
      }
    });

  } catch (error) {
    console.error('Bookmark toggle error:', error);
    c.status(500);
    return c.json({
      success: false,
      message: "Internal server error while toggling bookmark",
      error: "BOOKMARK_TOGGLE_FAILED"
    });
  }
});

// Get bookmark status for a post
bookmarkRouter.get('/:postId/status', async (c: AppContext) => {
  try {
    const prisma = getPrisma(c);
    const postId = c.req.param('postId');
    const userId = c.get('userId');
    
    const bookmark = await prisma.bookmark.findUnique({
      where: {
        userId_postId: {
          userId,
          postId
        }
      }
    });

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { bookmarksCount: true }
    });

    return c.json({
      success: true,
      data: {
        isBookmarked: !!bookmark,
        bookmarksCount: post?.bookmarksCount || 0
      }
    });

  } catch (error) {
    console.error('Bookmark status error:', error);
    c.status(500);
    return c.json({
      success: false,
      message: "Internal server error while getting bookmark status",
      error: "BOOKMARK_STATUS_FAILED"
    });
  }
});

// Get user's bookmarked posts
bookmarkRouter.get('/my-bookmarks', async (c: AppContext) => {
  try {
    const prisma = getPrisma(c);
    const userId = c.get('userId');
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '10');
    const skip = (page - 1) * limit;
    
    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 50) {
      c.status(400);
      return c.json({
        success: false,
        message: "Invalid pagination parameters",
        error: "INVALID_PAGINATION"
      });
    }
    
    // Get total bookmarks count
    const totalBookmarks = await prisma.bookmark.count({
      where: { userId }
    });
    
    // Get bookmarked posts
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            content: true,
            excerpt: true,
            slug: true,
            createdAt: true,
            views: true,
            likesCount: true,
            commentsCount: true,
            bookmarksCount: true,
            readTime: true,
            author: {
              select: {
                id: true,
                name: true,
                avatar: true,
                verified: true
              }
            },
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });
    
    const totalPages = Math.ceil(totalBookmarks / limit);
    
    return c.json({
      success: true,
      message: "Bookmarked posts fetched successfully",
      data: {
        bookmarks: bookmarks.map(b => ({
          ...b.post,
          bookmarkedAt: b.createdAt
        })),
        pagination: {
          currentPage: page,
          totalPages,
          totalBookmarks,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
    
  } catch (error) {
    console.error('Bookmarks fetch error:', error);
    c.status(500);
    return c.json({
      success: false,
      message: "Internal server error while fetching bookmarks",
      error: "BOOKMARKS_FETCH_FAILED"
    });
  }
});

export default bookmarkRouter;
