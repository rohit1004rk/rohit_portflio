# Rohit Kumar — Full-Stack MERN Portfolio

A **production-quality, full-stack MERN portfolio** for **Rohit Kumar — Full Stack + AI/ML Developer**.

Built with a **React + Vite frontend**, a **Node.js + Express + Mongoose backend**, and **MongoDB**. Content (projects & skills) is **API-driven** from MongoDB, with a local fallback so the site always renders. Includes routed pages, project detail pages, a working contact form, and a resume page.

> Architecture inspired by modern full-stack developer portfolios. All content, design, and code are original.

---

## ✨ Features

- **Routed multi-page app** (React Router) — Home, About, Skills, Projects, Project Detail, Achievements, Education, Resume, Contact, 404
- **Premium dark technical UI** — amber (#FFB454) primary accent, teal (#4FD8C4) AI/data accent, graphite surfaces
- **Three-font hierarchy** — Space Grotesk (display), Inter (body), JetBrains Mono (technical)
- **Animated hero** — neural-network canvas + typing terminal (visual-only, reduced-motion safe)
- **Dark / Light mode** — one-click theme toggle with system-preference default and localStorage persistence
- **24/7 AI chatbot** — floating chat widget that answers questions about Rohit's projects, skills, education, and contact (rule-based assistant built-in; optional real LLM via `AI_API_KEY`)
- **Admin panel** — `/admin` dashboard to track contact messages and chat queries (JWT-secured, role-based)
- **API-driven content** — projects & skills loaded from MongoDB via REST API, with graceful fallback
- **Project detail pages** — `/projects/:slug` with overview, problem, implementation, result, metrics, workflow, limitations, future work
- **Working contact form** — posts to the Express API, persists to MongoDB, rate-limited, optional email notification
- **Admin API** — JWT auth, role-based access, full CRUD for projects, skills, and messages
- **SPA fallback** — refreshing `/projects/fake-news-detector`, `/about`, etc. never 404s
- **Responsive & accessible** — mobile menu, keyboard nav, ESC close, reduced-motion support
- **Deployment-ready** — separate frontend/backend/database, env-var driven, GitHub-ready

---

## 🧱 Tech Stack

| Layer    | Tech                                               |
| -------- | -------------------------------------------------- |
| Frontend | React 18, Vite, React Router 6, Axios, React Icons |
| Backend  | Node.js, Express, Mongoose                         |
| Database | MongoDB (local or Atlas)                           |
| Auth     | JWT, bcryptjs                                      |
| Security | Helmet, CORS, express-rate-limit                   |
| Email    | Nodemailer (optional)                              |

---

## 📁 Project Structure

```
rohit-portfolio/
├── package.json              # root scripts (concurrently)
├── .gitignore
├── README.md
├── client/                   # React + Vite frontend
│   ├── package.json
│   ├── vite.config.js        # dev proxy /api -> localhost:5000
│   ├── index.html
│   ├── .env.example
│   ├── vercel.json           # SPA rewrite for Vercel
│   └── src/
│       ├── main.jsx
│       ├── App.jsx           # routes
│       ├── index.css         # design tokens + global styles
│       ├── api/api.js        # axios client
│       ├── data/            # content + local fallback data
│       ├── hooks/           # useReveal, useDocumentTitle
│       ├── components/
│       │   ├── layout/      # Navbar, Footer, Layout, ScrollToTop
│       │   ├── ui/          # SectionHeading, StatusBadge, TechTags, PageHero
│       │   └── home/        # Hero, TerminalVisual, NetworkCanvas, FeaturedProjects
│       └── pages/           # Home, About, Skills, Projects, ProjectDetail,
│                            #   Achievements, Education, Resume, Contact, NotFound
└── server/                   # Express + MongoDB backend
    ├── package.json
    ├── .env.example
    ├── server.js
    ├── config/db.js
    ├── models/               # Project, Skill, Message, User
    ├── controllers/          # project, skill, message, auth
    ├── routes/               # project, skill, message, auth
    ├── middleware/            # auth (JWT), error handling
    └── seed/seedAll.js       # seed projects + skills into MongoDB
```

---

## 🚀 Getting Started (Local, VS Code)

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/) — local install, or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

### 1. Install dependencies

```bash
npm run install-all
```

### 2. Configure the backend

```bash
cp server/.env.example server/.env
```

Edit `server/.env` and set at least:

```env
MONGO_URI=mongodb://127.0.0.1:27017/rohit_portfolio
JWT_SECRET=some_long_random_string
```

For MongoDB Atlas, replace `MONGO_URI` with your connection string.

### 3. Seed the database (optional)

```bash
npm run seed
```

Inserts the 6 projects and 8 skill categories into MongoDB.

### 4. Run in development

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

The Vite dev server proxies `/api` requests to the backend automatically, so no CORS issues locally.

---

## 🔌 API Endpoints

| Method | Endpoint                   | Description              | Access                |
| ------ | -------------------------- | ------------------------ | --------------------- |
| GET    | `/api/projects`            | List all projects        | Public                |
| GET    | `/api/projects/slug/:slug` | Get project by slug      | Public                |
| GET    | `/api/projects/:id`        | Get project by id        | Public                |
| POST   | `/api/projects`            | Create a project         | Admin                 |
| PUT    | `/api/projects/:id`        | Update a project         | Admin                 |
| DELETE | `/api/projects/:id`        | Delete a project         | Admin                 |
| GET    | `/api/skills`              | List skill categories    | Public                |
| POST   | `/api/skills`              | Create a skill category  | Admin                 |
| PUT    | `/api/skills/:id`          | Update a skill category  | Admin                 |
| DELETE | `/api/skills/:id`          | Delete a skill category  | Admin                 |
| POST   | `/api/messages`            | Submit a contact message | Public (rate-limited) |
| GET    | `/api/messages`            | List messages            | Admin                 |
| PATCH  | `/api/messages/:id/read`   | Mark message read        | Admin                 |
| DELETE | `/api/messages/:id`        | Delete a message         | Admin                 |
| POST   | `/api/auth/register`       | Register a user          | Public                |
| POST   | `/api/auth/login`          | Login, get JWT           | Public                |
| GET    | `/api/auth/me`             | Current user profile     | Private               |

> To make a user an **admin**, set `role: 'admin'` on their document in MongoDB (or adjust the register controller). Admin routes require a `Bearer <token>` header.

---

## ☁️ Deployment

The app is designed to deploy as **three separate pieces**: frontend, backend, database.

### Database (MongoDB Atlas)

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Create a database user and allow network access.
3. Copy the connection string into `MONGO_URI` on the backend host.

### Backend (Render / Railway / Fly.io)

1. Push the repo to GitHub.
2. On [Render](https://render.com), create a **Web Service** pointing at the repo.
3. Build command: `npm install && npm --prefix server install`
4. Start command: `npm start` (runs `server/server.js`)
5. Add env vars: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `NODE_ENV=production`.
6. A `render.yaml` blueprint is included for one-click setup.

### Frontend (Vercel)

1. On [Vercel](https://vercel.com), import the repo.
2. Set **Root Directory** to `client`.
3. Build command: `npm run build` (Vite).
4. Set env var `VITE_API_URL=https://your-backend.onrender.com`.
5. The included `vercel.json` rewrites all routes to `index.html` so client-side routing works (no 404 on refresh).

### Production build (single server)

If you prefer to serve the frontend from the Express server itself:

```bash
npm run build
NODE_ENV=production npm start
```

Express serves `client/dist` and falls back to `index.html` for all non-API routes.

---

## 🎨 Customization

- **Content**: edit `client/src/data/portfolioData.js` and `server/seed/seedAll.js`.
- **Colors / typography / spacing**: edit design tokens at the top of `client/src/index.css`.
- **Contact email notifications**: set `SMTP_*` and `MAIL_TO` in `server/.env` (e.g. a Gmail app password).
- **Links**: replace the LinkedIn placeholder in `Hero.jsx` / `ContactPage.jsx` with your real profile URL. No GitHub link is shown because no public profile URL is available yet.

---

## 🛡️ Admin Panel & AI Chatbot

### Admin panel
- URL: `/admin` (login) → `/admin` (dashboard)
- Default credentials after `npm run seed`: `admin@rohit.com` / `admin123` (override via `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `server/.env`)
- Tracks: contact form messages (read/unread, delete) and chatbot queries (delete)

### AI chatbot
- Floating chat widget on every page (bottom-right)
- Works out of the box with a built-in rule-based assistant (no API key needed, 24/7)
- To enable real AI answers, set in `server/.env`:
  ```env
  AI_API_KEY=sk-...
  AI_API_URL=https://api.openai.com/v1/chat/completions
  AI_MODEL=gpt-4o-mini
  ```
- Chat queries are saved to MongoDB and visible in the admin panel

## 📄 License

MIT — free to use for your portfolio.
