import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import Blog from "./models/Blog.js";
import blogPosts from "../client/src/data/blogData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const seedBlogs = async () => {
  try {
    await connectDB();

    console.log("MongoDB connected.");
    console.log(`Found ${blogPosts.length} existing blog posts.`);

    let inserted = 0;
    let skipped = 0;

    for (const post of blogPosts) {
      const existingBlog = await Blog.findOne({
        slug: post.slug,
      }).select("_id");

      if (existingBlog) {
        console.log(`Skipped existing blog: ${post.slug}`);
        skipped += 1;
        continue;
      }

      await Blog.create({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        author: post.author || "Rohit Kumar",
        category: post.category,
        tags: Array.isArray(post.tags) ? post.tags : [],
        readTime: post.readTime || "5 min read",
        featured: post.featured === true,
        published: true,
        publishedAt: post.date ? new Date(post.date) : new Date(),
        thumbnail: post.thumbnail || "",
      });

      console.log(`Inserted blog: ${post.slug}`);
      inserted += 1;
    }

    console.log("");
    console.log("================================");
    console.log("Blog migration completed.");
    console.log(`Inserted: ${inserted}`);
    console.log(`Skipped:  ${skipped}`);
    console.log("================================");

    process.exit(0);
  } catch (error) {
    console.error("Blog migration failed:");
    console.error(error);
    process.exit(1);
  }
};

seedBlogs();
