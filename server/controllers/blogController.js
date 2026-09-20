import mongoose from "mongoose";
import Blog from "../models/Blog.js";

const ALLOWED_FIELDS = [
  "title",
  "slug",
  "excerpt",
  "content",
  "author",
  "category",
  "tags",
  "readTime",
  "featured",
  "published",
  "publishedAt",
  "thumbnail",
  "order",
  "enabled",
];

function pickAllowedFields(source = {}) {
  return Object.fromEntries(
    Object.entries(source).filter(([key]) => ALLOWED_FIELDS.includes(key)),
  );
}

function normalizeString(value, fallback = "") {
  if (value === null || value === undefined) {
    return fallback;
  }

  return String(value).trim();
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => String(item ?? "").trim()).filter(Boolean);
}

function normalizeBoolean(value, fallback = false) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (normalized === "true") {
      return true;
    }

    if (normalized === "false") {
      return false;
    }
  }

  return fallback;
}

function normalizeNumber(value, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.floor(value));
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return Math.max(0, Math.floor(parsed));
    }
  }

  return fallback;
}

function normalizeBlogData(body = {}, existing = {}) {
  const data = pickAllowedFields(body);

  if ("title" in data) {
    data.title = normalizeString(data.title, existing.title || "");
  }

  if ("slug" in data) {
    data.slug = normalizeString(data.slug, existing.slug || "").toLowerCase();
  }

  if ("excerpt" in data) {
    data.excerpt = normalizeString(data.excerpt, existing.excerpt || "");
  }

  if ("content" in data) {
    data.content = normalizeString(data.content, existing.content || "");
  }

  if ("author" in data) {
    data.author = normalizeString(
      data.author,
      existing.author || "Rohit Kumar",
    );
  }

  if ("category" in data) {
    data.category = normalizeString(data.category, existing.category || "");
  }

  if ("readTime" in data) {
    data.readTime = normalizeString(
      data.readTime,
      existing.readTime || "5 min read",
    );
  }

  if ("thumbnail" in data) {
    data.thumbnail = normalizeString(data.thumbnail, existing.thumbnail || "");
  }

  if ("tags" in data) {
    data.tags = normalizeStringArray(data.tags);
  }

  if ("featured" in data) {
    data.featured = normalizeBoolean(data.featured, existing.featured === true);
  }

  if ("published" in data) {
    data.published = normalizeBoolean(
      data.published,
      existing.published !== false,
    );
  }

  if ("enabled" in data) {
    data.enabled = normalizeBoolean(data.enabled, existing.enabled !== false);
  }

  if ("order" in data) {
    data.order = normalizeNumber(
      data.order,
      Number.isFinite(existing.order) ? existing.order : 0,
    );
  }

  if ("publishedAt" in data) {
    const date = new Date(data.publishedAt);

    if (!Number.isNaN(date.getTime())) {
      data.publishedAt = date;
    } else {
      delete data.publishedAt;
    }
  }

  return data;
}

function normalizeBlogResponse(blog) {
  if (!blog) {
    return null;
  }

  const item = typeof blog.toObject === "function" ? blog.toObject() : blog;

  return {
    ...item,
    order: normalizeNumber(item.order, 0),
    enabled: item.enabled !== false,
    featured: item.featured === true,
    published: item.published !== false,
    tags: Array.isArray(item.tags) ? item.tags : [],
  };
}

function validateRequiredBlogFields(data) {
  const required = ["title", "slug", "excerpt", "content", "category"];

  return required.filter(
    (field) => !data[field] || String(data[field]).trim() === "",
  );
}

async function getNextBlogOrder() {
  const lastBlog = await Blog.findOne({})
    .sort({ order: -1, createdAt: -1 })
    .select("order")
    .lean();

  const currentOrder = normalizeNumber(lastBlog?.order, 0);

  return currentOrder + 1;
}

/*
|--------------------------------------------------------------------------
| GET ALL PUBLIC BLOG POSTS
|--------------------------------------------------------------------------
*/

export const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({
      published: { $ne: false },
      enabled: { $ne: false },
    })
      .sort({
        order: 1,
        featured: -1,
        publishedAt: -1,
        createdAt: -1,
      })
      .lean();

    return res.json(blogs.map(normalizeBlogResponse));
  } catch (error) {
    console.error("GET BLOGS ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch blog posts.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET ALL BLOG POSTS FOR ADMIN
|--------------------------------------------------------------------------
*/

export const getAdminBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({})
      .sort({
        order: 1,
        createdAt: -1,
      })
      .lean();

    return res.json(blogs.map(normalizeBlogResponse));
  } catch (error) {
    console.error("GET ADMIN BLOGS ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch blog posts.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET BLOG BY SLUG
|--------------------------------------------------------------------------
*/

export const getBlogBySlug = async (req, res) => {
  try {
    const slug = normalizeString(req.params.slug).toLowerCase();

    if (!slug) {
      return res.status(400).json({
        message: "Blog slug is required.",
      });
    }

    const blog = await Blog.findOne({
      slug,
      published: { $ne: false },
      enabled: { $ne: false },
    }).lean();

    if (!blog) {
      return res.status(404).json({
        message: "Blog post not found.",
      });
    }

    return res.json(normalizeBlogResponse(blog));
  } catch (error) {
    console.error("GET BLOG BY SLUG ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch blog post.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET BLOG BY ID
|--------------------------------------------------------------------------
*/

export const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid blog ID.",
      });
    }

    const blog = await Blog.findById(id).lean();

    if (!blog) {
      return res.status(404).json({
        message: "Blog post not found.",
      });
    }

    return res.json(normalizeBlogResponse(blog));
  } catch (error) {
    console.error("GET BLOG BY ID ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch blog post.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| CREATE BLOG POST
|--------------------------------------------------------------------------
*/

export const createBlog = async (req, res) => {
  try {
    const data = normalizeBlogData(req.body);

    const missing = validateRequiredBlogFields(data);

    if (missing.length) {
      return res.status(400).json({
        message: "Required blog fields are missing.",
        fields: missing,
      });
    }

    if (!("author" in data)) {
      data.author = "Rohit Kumar";
    }

    if (!("readTime" in data)) {
      data.readTime = "5 min read";
    }

    if (!("featured" in data)) {
      data.featured = false;
    }

    if (!("published" in data)) {
      data.published = true;
    }

    if (!("enabled" in data)) {
      data.enabled = true;
    }

    if (!("publishedAt" in data)) {
      data.publishedAt = new Date();
    }

    if (!("order" in data)) {
      data.order = await getNextBlogOrder();
    }

    const existingSlug = await Blog.findOne({
      slug: data.slug,
    }).select("_id");

    if (existingSlug) {
      return res.status(409).json({
        message: "A blog post with this slug already exists.",
      });
    }

    if (data.featured === true) {
      await Blog.updateMany(
        { featured: true },
        {
          $set: {
            featured: false,
          },
        },
      );
    }

    const blog = await Blog.create(data);

    return res.status(201).json({
      message: "Blog post created successfully.",
      blog: normalizeBlogResponse(blog),
    });
  } catch (error) {
    console.error("CREATE BLOG ERROR:", error);

    if (error?.code === 11000) {
      return res.status(409).json({
        message: "A blog post with this slug already exists.",
      });
    }

    return res.status(500).json({
      message: "Failed to create blog post.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE BLOG POST
|--------------------------------------------------------------------------
*/

export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid blog ID.",
      });
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        message: "Blog post not found.",
      });
    }

    const data = normalizeBlogData(req.body, blog.toObject());

    if ("title" in data && !data.title) {
      return res.status(400).json({
        message: "Blog title is required.",
      });
    }

    if ("slug" in data && !data.slug) {
      return res.status(400).json({
        message: "Blog slug is required.",
      });
    }

    if ("excerpt" in data && !data.excerpt) {
      return res.status(400).json({
        message: "Blog excerpt is required.",
      });
    }

    if ("content" in data && !data.content) {
      return res.status(400).json({
        message: "Blog content is required.",
      });
    }

    if ("category" in data && !data.category) {
      return res.status(400).json({
        message: "Blog category is required.",
      });
    }

    if ("slug" in data) {
      const duplicate = await Blog.findOne({
        slug: data.slug,
        _id: { $ne: id },
      }).select("_id");

      if (duplicate) {
        return res.status(409).json({
          message: "A blog post with this slug already exists.",
        });
      }
    }

    if (data.featured === true) {
      await Blog.updateMany(
        {
          _id: { $ne: id },
          featured: true,
        },
        {
          $set: {
            featured: false,
          },
        },
      );
    }

    Object.assign(blog, data);

    await blog.save();

    return res.json({
      message: "Blog post updated successfully.",
      blog: normalizeBlogResponse(blog),
    });
  } catch (error) {
    console.error("UPDATE BLOG ERROR:", error);

    if (error?.code === 11000) {
      return res.status(409).json({
        message: "A blog post with this slug already exists.",
      });
    }

    return res.status(500).json({
      message: "Failed to update blog post.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| DELETE BLOG POST
|--------------------------------------------------------------------------
*/

export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid blog ID.",
      });
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        message: "Blog post not found.",
      });
    }

    await Blog.deleteOne({
      _id: id,
    });

    return res.json({
      message: "Blog post deleted successfully.",
      deletedBlogId: id,
    });
  } catch (error) {
    console.error("DELETE BLOG ERROR:", error);

    return res.status(500).json({
      message: "Failed to delete blog post.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| DUPLICATE BLOG POST
|--------------------------------------------------------------------------
*/

export const duplicateBlog = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid blog ID.",
      });
    }

    const original = await Blog.findById(id).lean();

    if (!original) {
      return res.status(404).json({
        message: "Blog post not found.",
      });
    }

    const baseSlug = normalizeString(original.slug).toLowerCase();

    let newSlug = `${baseSlug}-copy`;
    let counter = 2;

    while (
      await Blog.exists({
        slug: newSlug,
      })
    ) {
      newSlug = `${baseSlug}-copy-${counter}`;
      counter += 1;
    }

    const nextOrder = await getNextBlogOrder();

    const duplicatedBlog = await Blog.create({
      title: `${original.title} (Copy)`,
      slug: newSlug,
      excerpt: original.excerpt,
      content: original.content,
      author: original.author || "Rohit Kumar",
      category: original.category,
      tags: Array.isArray(original.tags) ? original.tags : [],
      readTime: original.readTime || "5 min read",
      thumbnail: original.thumbnail || "",
      order: nextOrder,
      enabled: true,
      published: false,
      featured: false,
      publishedAt: null,
    });

    return res.status(201).json({
      message: "Blog post duplicated successfully.",
      blog: normalizeBlogResponse(duplicatedBlog),
    });
  } catch (error) {
    console.error("DUPLICATE BLOG ERROR:", error);

    return res.status(500).json({
      message: "Failed to duplicate blog post.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| REORDER BLOG POSTS
|--------------------------------------------------------------------------
*/

export const reorderBlogs = async (req, res) => {
  try {
    const { orders } = req.body;

    if (!Array.isArray(orders)) {
      return res.status(400).json({
        message: "Orders must be provided as an array.",
      });
    }

    const operations = [];

    for (const item of orders) {
      if (!item || !mongoose.Types.ObjectId.isValid(item.id)) {
        continue;
      }

      const order = normalizeNumber(item.order, 0);

      operations.push({
        updateOne: {
          filter: {
            _id: item.id,
          },
          update: {
            $set: {
              order,
            },
          },
        },
      });
    }

    if (operations.length > 0) {
      await Blog.bulkWrite(operations);
    }

    const blogs = await Blog.find({})
      .sort({
        order: 1,
        createdAt: -1,
      })
      .lean();

    return res.json({
      message: "Blog order updated successfully.",
      blogs: blogs.map(normalizeBlogResponse),
    });
  } catch (error) {
    console.error("REORDER BLOGS ERROR:", error);

    return res.status(500).json({
      message: "Failed to reorder blog posts.",
    });
  }
};
