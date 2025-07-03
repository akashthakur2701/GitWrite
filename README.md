
# ✍️ GitWrite
**GitWrite** is a blazing-fast, full-stack, serverless blogging platform inspired by Medium — built with modern web technologies like **React**, **Cloudflare Workers**, **Prisma**, **PostgreSQL**, and **TypeScript**. It’s designed to be scalable, secure, and developer-friendly, with shared type safety between backend and frontend using **Zod**.


## Demo

Insert gif or link to demo

coming soon
## 🚀 Features

- 🔐 **User Authentication** – Secure login and signup using **JWT** and **bcrypt** password hashing
- 📝 **Create, Edit, Delete Posts** – Authenticated users can fully manage their articles
- 💬 **Rich Text Writing** – Clean writing experience (Markdown/editor support coming soon)
- 🌐 **Serverless Backend** – Powered by **Cloudflare Workers** for edge performance
- 🔄 **Shared Zod Validation** – Single source of truth for validation and types
- 🧠 **TypeScript Everywhere** – Full type safety across backend and frontend
- 🗃️ **Database with Prisma + PostgreSQL** – Reliable data handling with pooling support



## 🧰 Tech Stack

| Layer        | Tech Stack                                 |
|--------------|---------------------------------------------|
| Frontend     | React, TypeScript                          |
| Backend      | Cloudflare Workers (Hono), TypeScript      |
| Validation   | Zod (shared between frontend and backend)  |
| Auth         | JWT, bcrypt                                |
| ORM/DB       | Prisma ORM, PostgreSQL                     |
| Deployment   | Vercel (Frontend), Cloudflare (Backend)    |

## Project Structure


## Run Locally

Clone the project

### 1. Clone the repository

```bash
git clone https://github.com/akashthakur2701/GitWrite.git
cd GitWrite 
```
### 2. Install dependencies

```bash
cd apps/backend && npm install
cd ../frontend && npm install
```

### 3. Set up environment variables
Create a .env file from the example:
```bash
cp .env.example .env

```
Edit the .env and fill in your credentials:
```bash
DATABASE_URL=postgresql://<username>:<password>@localhost:5432/gitwrite
JWT_SECRET=your_jwt_secret
```
### 4. Run database migrations
```bash 
npx prisma generate
npx prisma migrate dev --name init

```

### 5. Start development servers
```bash
# Start backend (Cloudflare Worker dev server)
cd apps/backend
npm run dev

# Start frontend (React Vite dev server)
cd ../frontend
npm run dev
```
##  🔐 Authentication Overview

- Passwords are hashed using bcrypt before storing in the database.

- JWTs are signed using a secret key and stored securely on the client.

- Protected routes are guarded using JWT verification middleware.

- Validation and error handling are done with Zod for safety.


## Deployment

### 1. Frontend (Vercel)
You can deploy easily by connecting your GitHub repo to Vercel:
```bash
cd apps/frontend
vercel --prod
```

### 2. ⚡ Backend (Cloudflare Workers)
Use Wrangler to deploy your Workers backend:
``` bash
cd apps/backend
wrangler deploy
```
Ensure your wrangler.jsonc has the correct environment bindings for DATABASE_URL and JWT_SECRET.


## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`DATABASE_URL` : PostgreSQL connection string

`JWT_SECRET` : 	Secret key for JWT signing/verification


## Roadmap & Future Plans
 - Rich Markdown-based editor (or TipTap)

 - Likes, comments, and bookmarks

- User profiles and followers

- Tags, search, and filtering

- Image uploads via Cloudinary

- Real-time notifications (Web Push / Socket.IO)

- Progressive Web App (PWA) support
## Author

- [Akash Thakur](https://github.com/akashthakur2701)

