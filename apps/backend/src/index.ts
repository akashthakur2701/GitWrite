import { Hono } from 'hono'
import { cors } from 'hono/cors';
import type {Env} from '../type/env';
import userRouter from '../routes/user.route';
import { getPrisma } from '../clients/prismaCilent';
import blogRouter from '../routes/blog.route';
const app = new Hono<{ Bindings: Env }>();



app.use('/*',cors());
app.get('/',(c)=>{ return c.text("gitwrite is runnig fine")  });

app.route('/api/v1/user',userRouter);
app.route('/api/v1/blog',blogRouter);







export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    return app.fetch(request, env, ctx);
  },
};
