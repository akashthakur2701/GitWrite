import type { Env } from "../type/env";
import { Hono } from "hono";
import { getPrisma } from "../clients/prismaClient";
import type { Context } from "hono";
import { postInput, updatePostInput } from "@akashthakur2701/zod";
import { authMiddleware } from "../middleware/auth.middleware";

const blogRouter = new Hono<{
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


blogRouter.use('/*', authMiddleware);

blogRouter.post('/', async (c: AppContext) => {
  try {
    const prisma = getPrisma(c);
    const body = await c.req.json();
    
    // Validate input with Zod
    const result = postInput.safeParse(body);
    if (!result.success) {
      c.status(400);
      return c.json({
        success: false,
        message: "Validation failed",
        errors: result.error.flatten().fieldErrors
      });
    }
    
    const { title, content } = result.data;
    const authorId = c.get("userId");
    
   
    const author = await prisma.user.findUnique({ 
      where: { id: authorId },
      select: { id: true, name: true }
    });
    
    if (!author) {
      c.status(404);
      return c.json({
        success: false,
        message: "Author not found",
        error: "AUTHOR_NOT_FOUND"
      });
    }
    

    const blog = await prisma.post.create({
      data: {
        title,
        content,
        authorId,
        published: true 
      },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        published: true,
        author: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    return c.json({
      success: true,
      message: "Blog post created successfully",
      data: {
        blog
      }
    });
    
  } catch (error) {
    console.error('Blog creation error:', error);
    c.status(500);
    return c.json({
      success: false,
      message: "Internal server error while creating blog",
      error: "BLOG_CREATION_FAILED"
    });
  }
})

blogRouter.put('/', async (c: AppContext) => {
  try {
    const prisma = getPrisma(c);
    const body = await c.req.json();
    
    // Validate input with Zod
    const result = updatePostInput.safeParse(body);
    if (!result.success) {
      c.status(400);
      return c.json({
        success: false,
        message: "Validation failed",
        errors: result.error.flatten().fieldErrors
      });
    }
    
    const { id, title, content } = result.data;
    const userId = c.get("userId");
    
    // Check if blog exists and user owns it
    const existingBlog = await prisma.post.findUnique({
      where: { id },
      select: {
        id: true,
        authorId: true,
        title: true
      }
    });
    
    if (!existingBlog) {
      c.status(404);
      return c.json({
        success: false,
        message: "Blog post not found",
        error: "BLOG_NOT_FOUND"
      });
    }
    
    // Check if user owns the blog
    if (existingBlog.authorId !== userId) {
      c.status(403);
      return c.json({
        success: false,
        message: "You don't have permission to update this blog",
        error: "UNAUTHORIZED_UPDATE"
      });
    }
    
    // Update the blog
    const updatedBlog = await prisma.post.update({
      where: { id },
      data: {
        title,
        content
      },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        published: true,
        author: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    return c.json({
      success: true,
      message: "Blog post updated successfully",
      data: {
        blog: updatedBlog
      }
    });
    
  } catch (error) {
    console.error('Blog update error:', error);
    c.status(500);
    return c.json({
      success: false,
      message: "Internal server error while updating blog",
      error: "BLOG_UPDATE_FAILED"
    });
  }
})
blogRouter.get('/bulk', async (c: AppContext) => {
  try {
    const prisma = getPrisma(c);
    
    // Get pagination parameters
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '10');
    const skip = (page - 1) * limit;
    
    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      c.status(400);
      return c.json({
        success: false,
        message: "Invalid pagination parameters",
        error: "INVALID_PAGINATION"
      });
    }
    
    // Get total count for pagination info
    const totalBlogs = await prisma.post.count({
      where: { published: true }
    });
    
    // Fetch blogs with pagination
    const blogs = await prisma.post.findMany({
      where: { published: true },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });
    
    const totalPages = Math.ceil(totalBlogs / limit);
    
    return c.json({
      success: true,
      message: "Blogs fetched successfully",
      data: {
        blogs,
        pagination: {
          currentPage: page,
          totalPages,
          totalBlogs,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
    
  } catch (error) {
    console.error('Bulk blogs fetch error:', error);
    c.status(500);
    return c.json({
      success: false,
      message: "Internal server error while fetching blogs",
      error: "BLOGS_FETCH_FAILED"
    });
  }
})



blogRouter.get('/:id', async (c: AppContext) => {
  try {
    const prisma = getPrisma(c);
    const id = c.req.param('id');
    
    // Validate blog ID format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!id || !uuidRegex.test(id)) {
      c.status(400);
      return c.json({
        success: false,
        message: "Invalid blog ID format",
        error: "INVALID_BLOG_ID"
      });
    }
    
    // Fetch the blog
    const blog = await prisma.post.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        published: true,
        author: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    if (!blog) {
      c.status(404);
      return c.json({
        success: false,
        message: "Blog post not found",
        error: "BLOG_NOT_FOUND"
      });
    }
    
    // Check if blog is published
    if (!blog.published) {
      c.status(403);
      return c.json({
        success: false,
        message: "Blog post is not published",
        error: "BLOG_NOT_PUBLISHED"
      });
    }
    
    return c.json({
      success: true,
      message: "Blog post fetched successfully",
      data: {
        blog
      }
    });
    
  } catch (error) {
    console.error('Single blog fetch error:', error);
    c.status(500);
    return c.json({
      success: false,
      message: "Internal server error while fetching blog",
      error: "BLOG_FETCH_FAILED"
    });
  }
})



export default blogRouter ;