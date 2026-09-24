const blogPosts = [
  {
    id: "getting-started-with-react",
    slug: "getting-started-with-react",
    title: "Getting Started with React: A Beginner's Guide",
    excerpt:
      "Learn the fundamentals of React, components, JSX, props, state, and how to build your first React application.",
    content: `
React is one of the most popular JavaScript libraries for building modern user interfaces.

In this article, we will understand the basic concepts of React and how beginners can start building real-world applications.

## What is React?

React is a JavaScript library developed for creating interactive and reusable user interfaces.

The main concept behind React is the component-based architecture. Instead of building an entire interface in one large file, we divide the interface into smaller reusable components.

## Components

A component is an independent and reusable part of a user interface.

For example:

- Navbar
- Hero section
- Button
- Footer
- Project card

Each component can have its own logic and structure.

## JSX

JSX allows us to write HTML-like syntax inside JavaScript.

For example:

const heading = <h1>Hello World</h1>;

JSX makes React code easier to understand and maintain.

## Props

Props are used to pass data from one component to another.

For example, a project card can receive:

- Project title
- Project description
- Project image
- Project technologies

This makes components reusable.

## State

State allows a component to store and manage changing data.

React provides hooks such as useState for managing component state.

## Conclusion

React becomes much easier once you understand components, JSX, props, and state.

The best way to learn React is to build projects and gradually introduce more advanced concepts.
    `,
    author: "Rohit Kumar",
    category: "React",
    tags: ["React", "JavaScript", "Frontend", "Web Development"],
    date: "2026-09-20",
    readTime: "5 min read",
    featured: true,
  },

  {
    id: "why-learn-javascript",
    slug: "why-learn-javascript",
    title: "Why JavaScript Is Important for Web Development",
    excerpt:
      "Understand why JavaScript is one of the most important technologies for modern frontend and full-stack development.",
    content: `
JavaScript is one of the core technologies of modern web development.

HTML provides the structure, CSS provides the presentation, and JavaScript provides the behavior and interactivity.

## Why JavaScript?

JavaScript allows developers to create interactive websites and applications.

It can be used for:

- Frontend development
- Backend development
- Mobile applications
- Desktop applications
- APIs
- Automation
- AI-related applications

## JavaScript in Frontend Development

Frameworks and libraries such as React, Vue, and Angular are built around JavaScript.

Learning JavaScript fundamentals makes learning these technologies much easier.

## JavaScript in Backend Development

With Node.js, JavaScript can also be used on the server.

This means developers can use JavaScript for both frontend and backend development.

## Conclusion

JavaScript is a powerful and versatile programming language.

For anyone interested in modern web development, learning JavaScript fundamentals is an important first step.
    `,
    author: "Rohit Kumar",
    category: "JavaScript",
    tags: ["JavaScript", "Web Development", "Programming"],
    date: "2026-09-20",
    readTime: "4 min read",
    featured: false,
  },

  {
    id: "building-mern-stack-projects",
    slug: "building-mern-stack-projects",
    title: "Building Real-World Projects with the MERN Stack",
    excerpt:
      "A practical introduction to MongoDB, Express, React, and Node.js and how they work together in full-stack applications.",
    content: `
The MERN stack is a popular technology stack for building full-stack JavaScript applications.

MERN stands for:

- MongoDB
- Express.js
- React
- Node.js

## MongoDB

MongoDB is a NoSQL database that stores information in a flexible document-based structure.

## Express.js

Express.js is a backend framework for Node.js.

It makes it easier to create APIs, routes, middleware, and server-side functionality.

## React

React is responsible for building the frontend user interface.

It allows developers to create reusable components and dynamic pages.

## Node.js

Node.js allows JavaScript to run outside the browser.

It is commonly used to build backend servers and APIs.

## How MERN Works Together

A typical MERN application works like this:

React sends a request to the backend.

Express and Node.js process the request.

The backend communicates with MongoDB.

MongoDB returns the required data.

The backend sends the response back to React.

React then updates the user interface.

## Conclusion

The MERN stack provides a complete JavaScript-based ecosystem for developing modern full-stack applications.

Building projects is one of the best ways to understand how these technologies work together.
    `,
    author: "Rohit Kumar",
    category: "MERN",
    tags: ["MERN", "MongoDB", "Express", "React", "Node.js"],
    date: "2026-09-20",
    readTime: "6 min read",
    featured: false,
  },
];

export default blogPosts;
