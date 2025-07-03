import type { Env } from "../type/env";
import { Hono } from "hono";
import { getPrisma } from "../clients/prismaCilent";
import { verify } from "hono/jwt";
import type { Context } from "hono";
import { postInput,updatePostInput } from "@akashthakur2701/zod";
const blogRouter = new Hono<{Bindings : Env,
  Variables : {
    userId : string 
  }
}>();
type JwtPayload = {
  id: string;
};
type AppContext = Context<{
  Bindings: Env;
  Variables: {
    userId: string;
  };
}>;
blogRouter.use('/*',async(c,next)=>{
     const authHeader = c.req.header("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
    c.status(403);
    return c.json({ msg: "Authorization header missing or malformed" });
  }
     const token = authHeader?.split(" ")[1]|| "";
     const user = await verify(token,c.env.JWT_SECRET) as JwtPayload;
 try{
     if(user){
      c.set("userId",user.id);
      await next();
     }
     else{
       c.status(403);
       console.log("eror found 1")
       return c.json({
        msg : "unauthorized access"
       })
     }
    }catch(e){
      console.log("eror found 2")
      c.status(403);
            return c.json({
                message: "You are not logged in"
            })
    }

})

blogRouter.post('/', async (c :AppContext) => {
 const prisma = getPrisma(c);
  const body = await c.req.json();
  const result = postInput.safeParse(body);
  
  if(!result.success){
     console.error("Zod validation error:", result.error.format()); // Log this!
  c.status(411);
  return c.json({ msg: "invalid input", error: result.error.flatten() });
  }
  const authorId = c.get("userId");
    const author = await prisma.user.findUnique({ where: { id: authorId } });
  if (!author) {
    c.status(404);
    return c.json({ msg: "Author (user) not found" });
  }
  try{
   
    const blogs = await prisma.post.create({
      data :  {
        title : body.title ,
        content : body.content,
        authorId : authorId  //return by middleware
      }
    })
   
    return c.json({
      blogId : blogs.id
    })
  }catch(e){
    console.error("Prisma create error:", e);
  c.status(500);
  return c.json({
    msg: "Error while creating blog",
    error: e instanceof Error ? e.message : "Unknown error"
  });
  }
})

blogRouter.put('/', async (c : AppContext) => {
 const prisma = getPrisma(c);
  const body = await c.req.json();
  const {success} = updatePostInput.safeParse(body);
   if(!success){
    c.status(411)
    return c.json({
      msg : "invalid input"
    })
  }
  try{
    const blog = await prisma.post.update({
      where : {
        id : body.id 
      },
      data :  {
        title : body.title ,
        content : body.content,
        //return by middleware
      }
    })
    return c.json({
       id: blog.id,
      msg: "blog updated"
    })
  }catch(e){
    c.status(400)
    c.json({
      msg: "error while updating blog"
    })
  }
})
blogRouter.get('/bulk', async (c : AppContext) => {
  const prisma = getPrisma(c);
  try{
  const blogs = await prisma.post.findMany({
    select : {
      content : true ,
      title : true ,
      id : true ,
      author : {
        select : {
          name: true
        }
      }
    }
  });
  console.log(blogs)
  
  return c.json(blogs);

}catch(e){
  c.status(402)
  return c.json({
    msg : "can't fetch all blog"
  })
}
})



blogRouter.get('/:id', async (c : AppContext) => {
 const prisma = getPrisma(c);
  const id = c.req.param('id');
  if (!id || typeof id !== "string" || id.length < 10) {
  c.status(400);
  return c.json({ msg: "Invalid blog ID" });
}
  try{
    const blog = await prisma.post.findUnique({
      where : {
        id : id 
      },
      select : {
        id : true ,
        title : true ,
        content : true ,
        createdAt : true ,
        author : {
          select : {
            name : true
          }
        }
      }
    });
    return c.json({
      blog
    })
  }catch(e){
    c.status(400)
    return c.json({
      msg: "no such blog exist "
    })
  }
})



export default blogRouter ;