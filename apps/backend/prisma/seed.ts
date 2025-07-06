import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Categories
  const categories = [
    { name: 'AI & Machine Learning', slug: 'ai-machine-learning', color: '#6366f1' },
    { name: 'Productivity', slug: 'productivity', color: '#10b981' },
    { name: 'Design', slug: 'design', color: '#f59e42' },
    { name: 'Startups', slug: 'startups', color: '#f43f5e' },
    { name: 'Wellness', slug: 'wellness', color: '#06b6d4' },
    { name: 'Programming', slug: 'programming', color: '#a21caf' },
  ];
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  // Tags
  const tags = [
    { name: 'React', slug: 'react' },
    { name: 'TypeScript', slug: 'typescript' },
    { name: 'UI/UX', slug: 'ui-ux' },
    { name: 'Cloud', slug: 'cloud' },
    { name: 'Remote Work', slug: 'remote-work' },
    { name: 'Mental Health', slug: 'mental-health' },
    { name: 'Open Source', slug: 'open-source' },
    { name: 'Web3', slug: 'web3' },
    { name: 'Productivity', slug: 'productivity-tag' },
    { name: 'Career', slug: 'career' },
  ];
  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    });
  }

  // Users
  const users = [
    {
      email: 'alice@example.com',
      name: 'Alice Johnson',
      password: await bcrypt.hash('password123', 10),
      bio: 'AI enthusiast and writer.',
      hobby: 'Chess',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      verified: true,
    },
    {
      email: 'bob@example.com',
      name: 'Bob Smith',
      password: await bcrypt.hash('password123', 10),
      bio: 'Productivity hacker and startup founder.',
      hobby: 'Running',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      verified: true,
    },
    {
      email: 'carla@example.com',
      name: 'Carla Gomez',
      password: await bcrypt.hash('password123', 10),
      bio: 'Designer and wellness advocate.',
      hobby: 'Yoga',
      avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
      verified: true,
    },
    {
      email: 'daniel@example.com',
      name: 'Daniel Lee',
      password: await bcrypt.hash('password123', 10),
      bio: 'Cloud engineer and open source lover.',
      hobby: 'Photography',
      avatar: 'https://randomuser.me/api/portraits/men/41.jpg',
      verified: false,
    },
    {
      email: 'emma@example.com',
      name: 'Emma Brown',
      password: await bcrypt.hash('password123', 10),
      bio: 'Mental health blogger.',
      hobby: 'Painting',
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
      verified: false,
    },
    {
      email: 'frank@example.com',
      name: 'Frank Miller',
      password: await bcrypt.hash('password123', 10),
      bio: 'Web3 explorer and developer.',
      hobby: 'Gaming',
      avatar: 'https://randomuser.me/api/portraits/men/55.jpg',
      verified: false,
    },
    {
      email: 'grace@example.com',
      name: 'Grace Kim',
      password: await bcrypt.hash('password123', 10),
      bio: 'UI/UX designer and career coach.',
      hobby: 'Cooking',
      avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
      verified: true,
    },
    {
      email: 'henry@example.com',
      name: 'Henry Ford',
      password: await bcrypt.hash('password123', 10),
      bio: 'Startup mentor and investor.',
      hobby: 'Golf',
      avatar: 'https://randomuser.me/api/portraits/men/23.jpg',
      verified: true,
    },
    {
      email: 'isabel@example.com',
      name: 'Isabel Martinez',
      password: await bcrypt.hash('password123', 10),
      bio: 'Wellness writer and productivity geek.',
      hobby: 'Cycling',
      avatar: 'https://randomuser.me/api/portraits/women/29.jpg',
      verified: false,
    },
    {
      email: 'jack@example.com',
      name: 'Jack Wilson',
      password: await bcrypt.hash('password123', 10),
      bio: 'Full-stack dev and open source contributor.',
      hobby: 'Travel',
      avatar: 'https://randomuser.me/api/portraits/men/77.jpg',
      verified: false,
    },
    {
      email: 'karen@example.com',
      name: 'Karen Osei',
      password: await bcrypt.hash('password123', 10),
      bio: 'Remote work advocate and blogger.',
      hobby: 'Hiking',
      avatar: 'https://randomuser.me/api/portraits/women/50.jpg',
      verified: true,
    },
    {
      email: 'liam@example.com',
      name: 'Liam Chen',
      password: await bcrypt.hash('password123', 10),
      bio: 'Tech lead and AI researcher.',
      hobby: 'Robotics',
      avatar: 'https://randomuser.me/api/portraits/men/12.jpg',
      verified: true,
    },
  ];
  const userRecords = [];
  for (const user of users) {
    const u = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
    userRecords.push(u);
  }

  // Helper for random
  const rand = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

  // Blogs
  const blogData = [
    {
      title: 'AI killed my coding brain but I’m rebuilding it',
      content: 'We sprinted into the AI age of autocomplete IDEs now we’re waking up wondering why we forgot how to write a for-loop.',
      excerpt: 'We sprinted into the AI age of autocomplete IDEs now we’re waking up wondering why we forgot how to write a for-loop.',
      featured: true,
      readTime: 4,
      views: 4400,
      published: true,
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      categorySlug: 'ai-machine-learning',
      tags: ['AI', 'Programming', 'Productivity'],
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'We Threw 1 Million Concurrent Users at Go, Rust, and Node—The Results Hurt',
      content: 'Not a benchmark. A real user storm. Here’s what happened when we stress-tested modern backends.',
      excerpt: 'Not a benchmark. A real user storm.',
      featured: true,
      readTime: 6,
      views: 2800,
      published: true,
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
      categorySlug: 'programming',
      tags: ['Programming', 'Cloud'],
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80',
    },
    // ... (add 18 more blogs with unique titles, content, tags, images, categories)
  ];

  // Add more blogs for a total of 20
  for (let i = 3; i <= 20; i++) {
    blogData.push({
      title: `Sample Blog Post ${i}`,
      content: `This is the content for blog post number ${i}. It covers a unique topic and provides value to the reader.`,
      excerpt: `This is the excerpt for blog post number ${i}.`,
      featured: i % 5 === 0,
      readTime: 3 + (i % 5),
      views: 100 * i,
      published: true,
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * i),
      categorySlug: rand(categories).slug,
      tags: [rand(tags).name, rand(tags).name],
      image: `https://source.unsplash.com/random/600x400?sig=${i}`,
    });
  }

  // Create blogs
  for (const blog of blogData) {
    const author = rand(userRecords);
    const category = await prisma.category.findUnique({ where: { slug: blog.categorySlug } });
    const post = await prisma.post.create({
      data: {
        title: blog.title,
        content: blog.content,
        excerpt: blog.excerpt,
        slug: blog.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.floor(Math.random()*10000),
        published: blog.published,
        featured: blog.featured,
        readTime: blog.readTime,
        views: blog.views,
        publishedAt: blog.publishedAt,
        authorId: author.id,
        categoryId: category?.id,
        // featuredImage: blog.image, // Uncomment if you have this field
      },
    });
    // Add tags
    for (const tagName of blog.tags) {
      const tag = await prisma.tag.findFirst({ where: { name: tagName } });
      if (tag) {
        await prisma.postTag.create({
          data: {
            postId: post.id,
            tagId: tag.id,
          },
        });
      }
    }
    // Add likes and comments
    const likeCount = Math.floor(Math.random() * userRecords.length);
    const commentCount = Math.floor(Math.random() * 5);
    const likedUsers = userRecords.slice(0, likeCount);
    for (const user of likedUsers) {
      await prisma.like.create({
        data: {
          userId: user.id,
          postId: post.id,
        },
      });
    }
    for (let c = 0; c < commentCount; c++) {
      const user = rand(userRecords);
      await prisma.comment.create({
        data: {
          content: `This is a comment by ${user.name} on ${blog.title}.`,
          authorId: user.id,
          postId: post.id,
        },
      });
    }
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
