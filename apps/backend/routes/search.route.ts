import type { Env } from "../type/env";
import { Hono } from "hono";
import { getPrisma } from "../clients/prismaClient";
import type { Context } from "hono";
import { searchInput } from "@akashthakur2701/zod";
import { authMiddleware } from "../middleware/auth.middleware";

const searchRouter = new Hono<{
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
searchRouter.use('/*', authMiddleware);

// Search blogs
searchRouter.get('/blogs', async (c: AppContext) => {
  try {
    const prisma = getPrisma(c);
    const query = c.req.query('query') || '';
    const category = c.req.query('category');
    const author = c.req.query('author');
    const sortBy = c.req.query('sortBy') || 'recent';
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

    // Build where conditions
    const whereConditions: any = {
      published: true,
      AND: []
    };

    // Text search in title and content
    if (query.trim()) {
      whereConditions.AND.push({
        OR: [
          {
            title: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            content: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            excerpt: {
              contains: query,
              mode: 'insensitive'
            }
          }
        ]
      });
    }

    // Category filter
    if (category) {
      whereConditions.AND.push({
        category: {
          slug: category
        }
      });
    }

    // Author filter
    if (author) {
      whereConditions.AND.push({
        author: {
          OR: [
            {
              name: {
                contains: author,
                mode: 'insensitive'
              }
            },
            {
              email: {
                contains: author,
                mode: 'insensitive'
              }
            }
          ]
        }
      });
    }

    // Remove empty AND array if no conditions
    if (whereConditions.AND.length === 0) {
      delete whereConditions.AND;
    }

    // Build orderBy
    let orderBy: any = { createdAt: 'desc' }; // default: recent
    
    switch (sortBy) {
      case 'popular':
        orderBy = { likesCount: 'desc' };
        break;
      case 'trending':
        orderBy = { views: 'desc' };
        break;
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    // Get total count
    const totalBlogs = await prisma.post.count({
      where: whereConditions
    });

    // Get blogs
    const blogs = await prisma.post.findMany({
      where: whereConditions,
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
        },
        tags: {
          select: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        }
      },
      orderBy,
      skip,
      take: limit
    });

    const totalPages = Math.ceil(totalBlogs / limit);

    return c.json({
      success: true,
      message: "Blog search completed successfully",
      data: {
        blogs: blogs.map(blog => ({
          ...blog,
          tags: blog.tags.map(t => t.tag)
        })),
        pagination: {
          currentPage: page,
          totalPages,
          totalBlogs,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        },
        searchQuery: {
          query,
          category,
          author,
          sortBy
        }
      }
    });

  } catch (error) {
    console.error('Blog search error:', error);
    c.status(500);
    return c.json({
      success: false,
      message: "Internal server error while searching blogs",
      error: "BLOG_SEARCH_FAILED"
    });
  }
});

// Search users
searchRouter.get('/users', async (c: AppContext) => {
  try {
    const prisma = getPrisma(c);
    const query = c.req.query('query') || '';
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

    // Build where conditions
    const whereConditions: any = {};

    if (query.trim()) {
      whereConditions.OR = [
        {
          name: {
            contains: query,
            mode: 'insensitive'
          }
        },
        {
          email: {
            contains: query,
            mode: 'insensitive'
          }
        },
        {
          bio: {
            contains: query,
            mode: 'insensitive'
          }
        },
        {
          hobby: {
            contains: query,
            mode: 'insensitive'
          }
        }
      ];
    }

    // Get total count
    const totalUsers = await prisma.user.count({
      where: whereConditions
    });

    // Get users
    const users = await prisma.user.findMany({
      where: whereConditions,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        bio: true,
        hobby: true,
        verified: true,
        rating: true,
        totalViews: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true
          }
        }
      },
      orderBy: [
        { verified: 'desc' },
        { rating: 'desc' },
        { totalViews: 'desc' }
      ],
      skip,
      take: limit
    });

    const totalPages = Math.ceil(totalUsers / limit);

    return c.json({
      success: true,
      message: "User search completed successfully",
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages,
          totalUsers,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        },
        searchQuery: {
          query
        }
      }
    });

  } catch (error) {
    console.error('User search error:', error);
    c.status(500);
    return c.json({
      success: false,
      message: "Internal server error while searching users",
      error: "USER_SEARCH_FAILED"
    });
  }
});

// Get search suggestions
searchRouter.get('/suggestions', async (c: AppContext) => {
  try {
    const prisma = getPrisma(c);
    const query = c.req.query('query') || '';
    
    if (!query.trim()) {
      return c.json({
        success: true,
        data: {
          blogs: [],
          users: [],
          tags: []
        }
      });
    }

    // Get blog suggestions
    const blogSuggestions = await prisma.post.findMany({
      where: {
        published: true,
        title: {
          contains: query,
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        title: true,
        slug: true
      },
      take: 5
    });

    // Get user suggestions
    const userSuggestions = await prisma.user.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            email: {
              contains: query,
              mode: 'insensitive'
            }
          }
        ]
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        verified: true
      },
      take: 5
    });

    // Get tag suggestions
    const tagSuggestions = await prisma.tag.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        name: true,
        slug: true
      },
      take: 5
    });

    return c.json({
      success: true,
      message: "Search suggestions fetched successfully",
      data: {
        blogs: blogSuggestions,
        users: userSuggestions,
        tags: tagSuggestions
      }
    });

  } catch (error) {
    console.error('Search suggestions error:', error);
    c.status(500);
    return c.json({
      success: false,
      message: "Internal server error while fetching search suggestions",
      error: "SEARCH_SUGGESTIONS_FAILED"
    });
  }
});

export default searchRouter;
