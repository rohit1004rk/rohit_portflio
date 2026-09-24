import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    excerpt: {
      type: String,
      required: true,
      trim: true,
    },

    content: {
      type: String,
      required: true,
    },

    author: {
      type: String,
      default: "Rohit Kumar",
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    readTime: {
      type: String,
      default: "5 min read",
      trim: true,
    },

    thumbnail: {
      type: String,
      default: "",
      trim: true,
    },

    /*
     * Blog display order.
     * Lower number appears first.
     */
    order: {
      type: Number,
      default: 0,
      min: 0,
    },

    /*
     * Controls whether this blog is active on the website.
     * false = Shutdown / Disabled
     */
    enabled: {
      type: Boolean,
      default: true,
    },

    /*
     * Controls whether the blog is published.
     */
    published: {
      type: Boolean,
      default: true,
    },

    /*
     * Only one blog should normally be featured.
     */
    featured: {
      type: Boolean,
      default: false,
    },

    publishedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;
