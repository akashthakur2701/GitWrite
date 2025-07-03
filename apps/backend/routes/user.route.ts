import type { Env } from "../type/env";
import { Hono } from "hono";
import { sign } from "hono/jwt";
import {getPrisma} from '../clients/prismaCilent'
import { Context } from "hono";
import { signinInput,signupInput } from "@akashthakur2701/zod";
const userRouter = new Hono<{Bindings : Env}>();

type AppContext = Context<{
  Bindings: Env;
  Variables: {
    userId: string;
  };
}>;

userRouter.post('/signup',async  (c :AppContext) => {
 
const prisma = getPrisma(c);
const body = await c.req.json();
console.log(body); 
const {success} = signupInput.safeParse(body);
if(!success){
  c.status(411)
  return c.json({
    msg: "Input not correct"
  })
} 
try{
const user = await  prisma.user.create({
  data : {
    email : body.email ,
    password : body.password,
    name : body.name 
  },
})
const token = await sign({id : user.id  },c.env.JWT_SECRET)
  return c.json(token)
}catch(e){
c.status(403);
console.log(e);
return c.json({error: "error while signing up"})
}
})





userRouter.post('/signin', async (c:AppContext) => {

    const prisma = getPrisma(c);

    const body = await c.req.json();
    const {success} = signinInput.safeParse(body);
    if(!success){
  c.status(411)
  return c.json({
    msg: "Input not correct"
  })
} 
try{
    const user = await prisma.user.findFirst({
        where: {
            email: body.email,
      password : body.password
        }
    });

    if (!user) {
        c.status(403);
        return c.json({ error: "user not found" });
    }

    const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
    return c.json({ jwt });
  }catch(e){
    c.status(411);
      return c.text('Invalid')
  }
})

export default userRouter;