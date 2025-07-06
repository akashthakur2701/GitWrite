import type { Env } from "../type/env";
import { Hono } from "hono";
import { getPrisma } from "../clients/prismaClient";
import type { Context } from "hono";
import { authMiddleware } from "../middleware/auth.middleware";

const likeRouter = new Hono<{
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
likeRouter.use('/*', authMiddleware);

// Toggle like on a post
likeRouter.post('/:postId', async (c: AppContext) => {
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

    // Check if user already liked this post
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId
        }
      }
    });

    let isLiked = false;
    let likesCount = 0;

    if (existingLike) {
      // Unlike: Remove the like
      await prisma.$transaction([
        prisma.like.delete({
          where: { id: existingLike.id }
        }),
        prisma.post.update({
          where: { id: postId },
          data: { likesCount: { decrement: 1 } }
        })
      ]);
      isLiked = false;
    } else {
      // Like: Add the like
      await prisma.$transaction([
        prisma.like.create({
          data: {
            userId,
            postId
          }
        }),
        prisma.post.update({
          where: { id: postId },
          data: { likesCount: { increment: 1 } }
        })
      ]);
      isLiked = true;
    }

    // Get updated likes count
    const updatedPost = await prisma.post.findUnique({
      where: { id: postId },
      select: { likesCount: true }
    });
    
    likesCount = updatedPost?.likesCount || 0;

    return c.json({
      success: true,
      message: isLiked ? "Post liked successfully" : "Post unliked successfully",
      data: {
        isLiked,
        likesCount
      }
    });

  } catch (error) {
    console.error('Like toggle error:', error);
    c.status(500);
    return c.json({
      success: false,
      message: "Internal server error while toggling like",
      error: "LIKE_TOGGLE_FAILED"
    });
  }
});

// Get like status for a post
likeRouter.get('/:postId/status', async (c: AppContext) => {
  try {
    const prisma = getPrisma(c);
    const postId = c.req.param('postId');
    const userId = c.get('userId');
    
    const like = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId
        }
      }
    });

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { likesCount: true }
    });

    return c.json({
      success: true,
      data: {
        isLiked: !!like,
        likesCount: post?.likesCount || 0
      }
    });

  } catch (error) {
    console.error('Like status error:', error);
    c.status(500);
    return c.json({
      success: false,
      message: "Internal server error while getting like status",
      error: "LIKE_STATUS_FAILED"
    });
  }
});

export default likeRouter;
