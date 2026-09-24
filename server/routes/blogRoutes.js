import express from "express";

import {
  getBlogs,
  getAdminBlogs,
  getBlogBySlug,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  duplicateBlog,
  reorderBlogs,
} from "../controllers/blogController.js";

import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Public Blog Routes
|--------------------------------------------------------------------------
*/

// Public: get all published + enabled blog posts
router.get("/", getBlogs);

// Public: get published + enabled blog post by slug
router.get("/slug/:slug", getBlogBySlug);

/*
|--------------------------------------------------------------------------
| Admin Blog Routes
|--------------------------------------------------------------------------
*/

// Admin: get all blog posts including drafts/disabled posts
router.get("/admin", protect, admin, getAdminBlogs);

// Admin: reorder blog posts
// IMPORTANT: keep this before "/:id"
router.put("/reorder", protect, admin, reorderBlogs);

// Admin: get blog post by ID
router.get("/:id", protect, admin, getBlogById);

// Admin: create blog post
router.post("/", protect, admin, createBlog);

// Admin: update blog post
router.put("/:id", protect, admin, updateBlog);

// Admin: duplicate blog post
router.post("/:id/duplicate", protect, admin, duplicateBlog);

// Admin: delete blog post
router.delete("/:id", protect, admin, deleteBlog);

export default router;
