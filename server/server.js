import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import connectDB from './config/db.js';
import projectRoutes from './routes/projectRoutes.js';
import skillRoutes from './routes/skillRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Render/Railway/Vercel run behind a proxy: needed for correct client IPs
// (rate limiting) and secure cookies.
app.set('trust proxy', 1);

// ── Database ─────────────────────────────────────────────
connectDB();

// ── Security & middleware ────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin: process.env.CLIENT_URL?.split(',').map((s) => s.trim()) || ['http://localhost:5173'],
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// ── Rate limiting (contact form / auth / chat) ───────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many messages. Please try again later.' },
});
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: { message: 'Too many chat requests. Please slow down a little.' },
});

// ── Routes ────────────────────────────────────────────────
app.get('/api', (req, res) =>
  res.json({ message: 'Rohit Kumar Portfolio API', status: 'ok', version: '3.0.0' })
);
app.get('/api/health', (req, res) =>
  res.json({
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: Math.round(process.uptime()),
  })
);
app.use('/api/projects', apiLimiter, projectRoutes);
app.use('/api/skills', apiLimiter, skillRoutes);
app.use('/api/messages', contactLimiter, messageRoutes);
app.use('/api/auth', apiLimiter, authRoutes);
app.use('/api/chat', chatLimiter, chatRoutes);
app.use('/api/admin', adminRoutes);

// ── Serve the built React app in production ───────────────
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../client/dist');
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    app.use(express.static(distPath));
    // SPA fallback — every non-API route returns index.html so refreshing
    // /projects, /about, /projects/:slug, /admin never 404s.
    app.get(/^(?!\/api).*/, (req, res) => res.sendFile(indexPath));
  } else {
    console.warn('⚠️ client/dist not found. Did the client build run during deploy?');
    app.get(/^(?!\/api).*/, (req, res) =>
      res.status(503).send('Frontend build not found. Run the client build during deployment.')
    );
  }
}

// ── Error handling ────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(
    `\n🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
  )
);
