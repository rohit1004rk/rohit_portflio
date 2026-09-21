import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import dns from "dns";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });
dns.setDefaultResultOrder("ipv4first");

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import homeRoutes from "./routes/homeRoutes.js";
import aboutRoutes from "./routes/aboutRoutes.js";
import connectDB from "./config/db.js";
import projectRoutes from "./routes/projectRoutes.js";
import skillRoutes from "./routes/skillRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import certificateRoutes from "./routes/certificateRoutes.js";
import experienceRoutes from "./routes/experienceRoutes.js";
import educationRoutes from "./routes/educationRoutes.js";
import portfolioSettingsRoutes from "./routes/portfolioSettingsRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
const app = express();

// Render/Railway/Vercel run behind a proxy: needed for correct client IPs
// (rate limiting) and secure cookies.
app.set("trust proxy", 1);

// ── Security & middleware ────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}
app.use("/api/resume", resumeRoutes);
// ── Rate limiting ────────────────────────────────────────

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many messages. Please try again later.",
  },
});

const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many chat requests. Please slow down a little.",
  },
});

const contactPostLimiter = (req, res, next) => {
  if (req.method === "POST") {
    return contactLimiter(req, res, next);
  }

  next();
};

// ── Routes ────────────────────────────────────────────────

app.get("/api", (req, res) =>
  res.json({
    message: "Rohit Kumar Portfolio API",
    status: "ok",
    version: "3.0.0",
  }),
);

app.get("/api/health", (req, res) =>
  res.json({
    status: "ok",
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    uptime: Math.round(process.uptime()),
  }),
);

app.use("/api/projects", apiLimiter, projectRoutes);
app.use("/api/skills", apiLimiter, skillRoutes);

app.use("/api/messages", contactPostLimiter, messageRoutes);

app.use("/api/auth", apiLimiter, authRoutes);
app.use("/api/chat", chatLimiter, chatRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/settings", portfolioSettingsRoutes);
app.use("/api/certificates", apiLimiter, certificateRoutes);
app.use("/api/experiences", apiLimiter, experienceRoutes);
app.use("/api/education", apiLimiter, educationRoutes);
app.use("/api/blogs", apiLimiter, blogRoutes);

// Home API
app.use("/api/home", apiLimiter, homeRoutes);

// About API
app.use("/api/about", apiLimiter, aboutRoutes);

// ── Serve the built React app in production ───────────────
if (process.env.NODE_ENV === "production") {
  const distPath = path.join(__dirname, "../client/dist");
  const indexPath = path.join(distPath, "index.html");

  if (fs.existsSync(indexPath)) {
    app.use(express.static(distPath));

    app.get(/^(?!\/api).*/, (req, res) => res.sendFile(indexPath));
  } else {
    console.warn(
      "⚠️ client/dist not found. Did the client build run during deploy?",
    );

    app.get(/^(?!\/api).*/, (req, res) =>
      res
        .status(503)
        .send(
          "Frontend build not found. Run the client build during deployment.",
        ),
    );
  }
}

// ── Error handling ────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Server startup ────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () =>
      console.log(
        `\n🚀 Server running in ${
          process.env.NODE_ENV || "development"
        } mode on port ${PORT}`,
      ),
    );
  } catch (error) {
    console.error(
      "❌ Server startup failed because MongoDB connection failed.",
    );
    process.exit(1);
  }
};

startServer();
