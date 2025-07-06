import type { Env } from "../type/env";
import { Hono } from "hono";
import { getPrisma } from "../clients/prismaClient";
import type { Context } from "hono";
import { createCommentInput } from "@akashthakur2701/zod";
import { authMiddleware } from "../middleware/auth.middleware";

const commentRouter = new Hono<{
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
commentRouter.use('/*', authMiddleware);

// Create a comment
commentRouter.post('/', async (c: AppContext) => {
  try {
    const prisma = getPrisma(c);
    const body = await c.req.json();
    const userId = c.get('userId');
    
    // Validate input with Zod
    const result = createCommentInput.safeParse(body);
    if (!result.success) {
      c.status(400);
      return c.json({
        success: false,
        message: "Validation failed",
        errors: result.error.flatten().fieldErrors
      });
    }
    
    const { content, postId, parentId } = result.data;
    
    // Check if post exists and is published
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
    
    // If parentId is provided, check if parent comment exists
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { id: true, postId: true }
      });
      
      if (!parentComment || parentComment.postId !== postId) {
        c.status(404);
        return c.json({
          success: false,
          message: "Parent comment not found or belongs to different post",
          error: "PARENT_COMMENT_NOT_FOUND"
        });
      }
    }
    
    // Create comment and update post comment count
    const [comment] = await prisma.$transaction([
      prisma.comment.create({
        data: {
          content,
          postId,
          authorId: userId,
          parentId: parentId || null
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          },
          replies: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  avatar: true
                }
              }
            },
            orderBy: {
              createdAt: 'asc'
            }
          }
        }
      }),
      prisma.post.update({
        where: { id: postId },
        data: { commentsCount: { increment: 1 } }
      })
    ]);
    
    return c.json({
      success: true,
      message: "Comment created successfully",
      data: { comment }
    });
    
  } catch (error) {
    console.error('Comment creation error:', error);
    c.status(500);
    return c.json({
      success: false,
      message: "Internal server error while creating comment",
      error: "COMMENT_CREATION_FAILED"
    });
  }
});

// Get comments for a post
commentRouter.get('/post/:postId', async (c: AppContext) => {
  try {
    const prisma = getPrisma(c);
    const postId = c.req.param('postId');
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
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
    
    // Get total count of top-level comments
    const totalComments = await prisma.comment.count({
      where: { 
        postId,
        parentId: null 
      }
    });
    
    // Get top-level comments with replies
    const comments = await prisma.comment.findMany({
      where: { 
        postId,
        parentId: null 
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        replies: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });
    
    const totalPages = Math.ceil(totalComments / limit);
    
    return c.json({
      success: true,
      message: "Comments fetched successfully",
      data: {
        comments,
        pagination: {
          currentPage: page,
          totalPages,
          totalComments,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
    
  } catch (error) {
    console.error('Comments fetch error:', error);
    c.status(500);
    return c.json({
      success: false,
      message: "Internal server error while fetching comments",
      error: "COMMENTS_FETCH_FAILED"
    });
  }
});

// Delete a comment (only by author)
commentRouter.delete('/:commentId', async (c: AppContext) => {
  try {
    const prisma = getPrisma(c);
    const commentId = c.req.param('commentId');
    const userId = c.get('userId');
    
    // Find the comment
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        authorId: true,
        postId: true,
        parentId: true
      }
    });
    
    if (!comment) {
      c.status(404);
      return c.json({
        success: false,
        message: "Comment not found",
        error: "COMMENT_NOT_FOUND"
      });
    }
    
    // Check if user owns the comment
    if (comment.authorId !== userId) {
      c.status(403);
      return c.json({
        success: false,
        message: "You don't have permission to delete this comment",
        error: "UNAUTHORIZED_DELETE"
      });
    }
    
    // Delete comment and update post comment count
    await prisma.$transaction([
      prisma.comment.delete({
        where: { id: commentId }
      }),
      prisma.post.update({
        where: { id: comment.postId },
        data: { commentsCount: { decrement: 1 } }
      })
    ]);
    
    return c.json({
      success: true,
      message: "Comment deleted successfully"
    });
    
  } catch (error) {
    console.error('Comment deletion error:', error);
    c.status(500);
    return c.json({
      success: false,
      message: "Internal server error while deleting comment",
      error: "COMMENT_DELETION_FAILED"
    });
  }
});

export default commentRouter;
