import dotenv from "dotenv";
import mongoose from "mongoose";
import Blog from "./models/Blog.js";

dotenv.config({ path: "./server/.env" });

const demoBlogs = [
  {
    title: "How I Built My First MERN Stack Project",
    slug: "how-i-built-my-first-mern-stack-project",
    excerpt:
      "A practical look at how I approached building a full-stack application using MongoDB, Express, React and Node.js.",
    content: `# How I Built My First MERN Stack Project

Building a full-stack project was one of the most useful experiences in my development journey.

Instead of learning technologies separately, I wanted to understand how the complete application works together.

## The Technology Stack

- MongoDB for database management
- Express.js for backend APIs
- React for the frontend
- Node.js for the server
- JWT for authentication

## Starting With the Frontend

I started by creating the main React pages and reusable components.

The goal was to keep the UI simple, responsive and easy to maintain.

## Connecting the Backend

After creating the frontend structure, I created REST APIs with Express and connected them to MongoDB.

This helped me understand how data moves between the browser, server and database.

## What I Learned

The biggest lesson was that building a project is different from simply learning individual technologies.

You start understanding architecture, debugging, API design and how different parts of an application communicate with each other.

## Final Thoughts

A real project does not have to be huge.

Even a small MERN application can teach you a lot when you build it from start to finish.`,
    author: "Rohit Kumar",
    category: "MERN",
    tags: ["MERN", "React", "Node.js", "MongoDB"],
    readTime: "6 min read",
    order: 1,
    enabled: true,
    published: true,
    featured: true,
    publishedAt: new Date("2026-09-18T10:00:00+05:30"),
  },

  {
    title: "React Components: A Practical Beginner's Guide",
    slug: "react-components-practical-beginners-guide",
    excerpt:
      "Understand React components, props, state and reusable UI patterns through a simple practical approach.",
    content: `# React Components: A Practical Beginner's Guide

React becomes much easier to understand when you think in terms of reusable components.

A component represents one small part of your user interface.

## What Is a Component?

A React component is usually a JavaScript function that returns JSX.

For example, a button, navbar, card or complete page can be represented as a component.

## Why Reusable Components Matter

Reusable components help keep a project organized.

Instead of writing the same UI code multiple times, you can create it once and reuse it wherever required.

## Props

Props allow a component to receive information from its parent component.

They are useful when the same component needs to display different data.

## State

State is used when a component needs to remember information that can change over time.

Forms, counters, filters and interactive interfaces commonly use state.

## Final Thoughts

The best way to learn React is to build small components and gradually combine them into complete applications.`,
    author: "Rohit Kumar",
    category: "React",
    tags: ["React", "JavaScript", "Frontend", "Web Development"],
    readTime: "5 min read",
    order: 2,
    enabled: true,
    published: true,
    featured: false,
    publishedAt: new Date("2026-09-15T11:30:00+05:30"),
  },

  {
    title: "JavaScript Concepts Every Frontend Developer Should Know",
    slug: "javascript-concepts-every-frontend-developer-should-know",
    excerpt:
      "A practical overview of JavaScript concepts that are important when building modern frontend applications.",
    content: `# JavaScript Concepts Every Frontend Developer Should Know

JavaScript is the foundation of modern frontend development.

Learning the syntax is only the beginning. Understanding how JavaScript behaves is much more important when working on real applications.

## Variables and Scope

Understanding let, const and scope helps prevent many common bugs.

It also makes larger applications easier to reason about.

## Functions

Functions are one of the most important building blocks in JavaScript.

Modern applications use regular functions, arrow functions and callback functions extensively.

## Arrays and Objects

Most frontend applications work heavily with arrays and objects.

Methods such as map, filter, find and reduce are especially useful when working with application data.

## Async JavaScript

Fetching data from APIs requires understanding promises and async/await.

These concepts become essential when building React applications that communicate with a backend.

## Final Thoughts

You do not need to memorize every JavaScript feature.

Focus on understanding the concepts that you use regularly while building projects.`,
    author: "Rohit Kumar",
    category: "JavaScript",
    tags: ["JavaScript", "Frontend", "ES6", "Programming"],
    readTime: "7 min read",
    order: 3,
    enabled: true,
    published: true,
    featured: false,
    publishedAt: new Date("2026-09-12T09:00:00+05:30"),
  },

  {
    title: "Building a Responsive Portfolio Website",
    slug: "building-a-responsive-portfolio-website",
    excerpt:
      "The key ideas I follow when creating a responsive portfolio that works well across laptops, tablets and mobile devices.",
    content: `# Building a Responsive Portfolio Website

A portfolio website should represent your skills while remaining simple and easy to navigate.

The same website should work comfortably on a laptop, tablet and mobile phone.

## Start With Structure

Before adding animations or advanced effects, I prefer creating a clear page structure.

Important sections usually include:

- Home
- About
- Skills
- Projects
- Experience
- Education
- Blog
- Contact

## Responsive Design

Responsive design means that the interface adapts to different screen sizes.

CSS Grid, Flexbox and media queries are useful tools for achieving this.

## Keep the UI Consistent

Typography, spacing, colors, buttons and cards should follow a consistent design system.

This makes the website feel like one complete product.

## Performance Matters

A beautiful portfolio should also load quickly.

Optimizing images, avoiding unnecessary JavaScript and keeping components reusable can improve the overall experience.

## Final Thoughts

A portfolio does not need hundreds of features.

A clean interface that clearly communicates your work is often more effective than an unnecessarily complicated design.`,
    author: "Rohit Kumar",
    category: "Web Development",
    tags: ["Portfolio", "Responsive Design", "CSS", "Frontend"],
    readTime: "5 min read",
    order: 4,
    enabled: true,
    published: true,
    featured: false,
    publishedAt: new Date("2026-09-10T14:00:00+05:30"),
  },
];

const seedDemoBlogs = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from server/.env");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected.");

    let inserted = 0;
    let skipped = 0;

    for (const blogData of demoBlogs) {
      const existingBlog = await Blog.findOne({
        slug: blogData.slug,
      });

      if (existingBlog) {
        console.log(`Skipped existing blog: ${blogData.slug}`);
        skipped += 1;
        continue;
      }

      await Blog.create(blogData);

      console.log(`Inserted demo blog: ${blogData.title}`);
      inserted += 1;
    }

    console.log("");
    console.log("================================");
    console.log("Demo blog migration completed.");
    console.log(`Inserted: ${inserted}`);
    console.log(`Skipped: ${skipped}`);
    console.log("================================");
  } catch (error) {
    console.error("Demo blog migration failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedDemoBlogs();
