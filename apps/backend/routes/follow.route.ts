import type { Env } from "../type/env";
import { Hono } from "hono";
import { getPrisma } from "../clients/prismaClient";
import type { Context } from "hono";
import { authMiddleware } from "../middleware/auth.middleware";

const followRouter = new Hono<{
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
followRouter.use('/*', authMiddleware);

// Toggle follow/unfollow a user
followRouter.post('/:targetUserId', async (c: AppContext) => {
  try {
    const prisma = getPrisma(c);
    const targetUserId = c.req.param('targetUserId');
    const followerId = c.get('userId');
    
    // Validate target user ID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!targetUserId || !uuidRegex.test(targetUserId)) {
      c.status(400);
      return c.json({
        success: false,
        message: "Invalid user ID format",
        error: "INVALID_USER_ID"
      });
    }

    // Check if user is trying to follow themselves
    if (followerId === targetUserId) {
      c.status(400);
      return c.json({
        success: false,
        message: "You cannot follow yourself",
        error: "SELF_FOLLOW_NOT_ALLOWED"
      });
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, name: true }
    });

    if (!targetUser) {
      c.status(404);
      return c.json({
        success: false,
        message: "User not found",
        error: "USER_NOT_FOUND"
      });
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: targetUserId
        }
      }
    });

    let isFollowing = false;

    if (existingFollow) {
      // Unfollow: Remove the follow relationship
      await prisma.follow.delete({
        where: { id: existingFollow.id }
      });
      isFollowing = false;
    } else {
      // Follow: Create the follow relationship
      await prisma.follow.create({
        data: {
          followerId,
          followingId: targetUserId
        }
      });
      isFollowing = true;
    }

    // Get updated follower counts
    const [followerCount, followingCount] = await Promise.all([
      prisma.follow.count({
        where: { followingId: targetUserId }
      }),
      prisma.follow.count({
        where: { followerId }
      })
    ]);

    return c.json({
      success: true,
      message: isFollowing 
        ? `You are now following ${targetUser.name}` 
        : `You unfollowed ${targetUser.name}`,
      data: {
        isFollowing,
        targetUser: {
          id: targetUser.id,
          name: targetUser.name,
          followerCount
        },
        currentUser: {
          followingCount
        }
      }
    });

  } catch (error) {
    console.error('Follow toggle error:', error);
    c.status(500);
    return c.json({
      success: false,
      message: "Internal server error while toggling follow",
      error: "FOLLOW_TOGGLE_FAILED"
    });
  }
});

// Get follow status between users
followRouter.get('/:targetUserId/status', async (c: AppContext) => {
  try {
    const prisma = getPrisma(c);
    const targetUserId = c.req.param('targetUserId');
    const followerId = c.get('userId');
    
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: targetUserId
        }
      }
    });

    // Get follower count for target user
    const followerCount = await prisma.follow.count({
      where: { followingId: targetUserId }
    });

    return c.json({
      success: true,
      data: {
        isFollowing: !!follow,
        followerCount
      }
    });

  } catch (error) {
    console.error('Follow status error:', error);
    c.status(500);
    return c.json({
      success: false,
      message: "Internal server error while getting follow status",
      error: "FOLLOW_STATUS_FAILED"
    });
  }
});

// Get user's followers
followRouter.get('/followers/:userId', async (c: AppContext) => {
  try {
    const prisma = getPrisma(c);
    const userId = c.req.param('userId');
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
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true }
    });
    
    if (!user) {
      c.status(404);
      return c.json({
        success: false,
        message: "User not found",
        error: "USER_NOT_FOUND"
      });
    }
    
    // Get total followers count
    const totalFollowers = await prisma.follow.count({
      where: { followingId: userId }
    });
    
    // Get followers
    const followers = await prisma.follow.findMany({
      where: { followingId: userId },
      include: {
        follower: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            bio: true,
            verified: true,
            _count: {
              select: {
                posts: true,
                followers: true
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
    
    const totalPages = Math.ceil(totalFollowers / limit);
    
    return c.json({
      success: true,
      message: "Followers fetched successfully",
      data: {
        followers: followers.map(f => f.follower),
        pagination: {
          currentPage: page,
          totalPages,
          totalFollowers,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
    
  } catch (error) {
    console.error('Followers fetch error:', error);
    c.status(500);
    return c.json({
      success: false,
      message: "Internal server error while fetching followers",
      error: "FOLLOWERS_FETCH_FAILED"
    });
  }
});

// Get user's following
followRouter.get('/following/:userId', async (c: AppContext) => {
  try {
    const prisma = getPrisma(c);
    const userId = c.req.param('userId');
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
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true }
    });
    
    if (!user) {
      c.status(404);
      return c.json({
        success: false,
        message: "User not found",
        error: "USER_NOT_FOUND"
      });
    }
    
    // Get total following count
    const totalFollowing = await prisma.follow.count({
      where: { followerId: userId }
    });
    
    // Get following
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      include: {
        following: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            bio: true,
            verified: true,
            _count: {
              select: {
                posts: true,
                followers: true
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
    
    const totalPages = Math.ceil(totalFollowing / limit);
    
    return c.json({
      success: true,
      message: "Following fetched successfully",
      data: {
        following: following.map(f => f.following),
        pagination: {
          currentPage: page,
          totalPages,
          totalFollowing,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
    
  } catch (error) {
    console.error('Following fetch error:', error);
    c.status(500);
    return c.json({
      success: false,
      message: "Internal server error while fetching following",
      error: "FOLLOWING_FETCH_FAILED"
    });
  }
});

export default followRouter;
