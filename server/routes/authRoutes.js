import express from "express";

import {
  registerUser,
  loginUser,
  getMe,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

import { protect, admin } from "../middleware/authMiddleware.js";

import { validateBody } from "../middleware/validateMiddleware.js";

import rateLimit from "express-rate-limit";

const router = express.Router();

const loginRules = {
  email: {
    required: true,
    label: "Email",
    type: "email",
    max: 200,
  },

  password: {
    required: true,
    label: "Password",
    min: 6,
    max: 200,
  },
};

const registerRules = {
  name: {
    required: true,
    label: "Name",
    min: 2,
    max: 100,
  },

  ...loginRules,
};

// Login rate limit:
// Maximum 5 failed login attempts from the same IP
// within 15 minutes.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    message: "Too many failed login attempts. Please try again later.",
  },
});

/*
 * Forgot-password rate limit.
 *
 * This endpoint intentionally returns the same response whether
 * an admin account exists or not, so account enumeration is prevented.
 *
 * Maximum 3 requests from the same IP within 15 minutes.
 */
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many password reset requests. Please try again later.",
  },
});

/*
 * Reset-password rate limit.
 *
 * Maximum 5 reset attempts from the same IP within 15 minutes.
 * This adds another layer of protection against token/password abuse.
 */
const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many password reset attempts. Please try again later.",
  },
});

const forgotPasswordRules = {
  email: {
    required: true,
    label: "Email",
    type: "email",
    max: 200,
  },
};

const resetPasswordRules = {
  token: {
    required: true,
    label: "Reset token",
    min: 32,
    max: 256,
  },

  password: {
    required: true,
    label: "New password",
    min: 8,
    max: 128,
  },

  confirmPassword: {
    required: true,
    label: "Confirm password",
    min: 8,
    max: 128,
  },
};

// User creation is admin-only: this is a single-owner portfolio, so public
// self-registration would let anyone create accounts on the API.
router.post(
  "/register",
  protect,
  admin,
  validateBody(registerRules),
  registerUser,
);

// Existing login route and rate limiter remain unchanged.
router.post("/login", loginLimiter, validateBody(loginRules), loginUser);

/*
 * Password recovery.
 *
 * Public endpoint because the admin may be completely logged out.
 * The controller always returns a generic response.
 */
router.post(
  "/forgot-password",
  forgotPasswordLimiter,
  validateBody(forgotPasswordRules),
  forgotPassword,
);

/*
 * Password reset.
 *
 * Public endpoint because the admin is not authenticated while
 * using the emailed one-time reset link.
 */
router.post(
  "/reset-password",
  resetPasswordLimiter,
  validateBody(resetPasswordRules),
  resetPassword,
);

router.get("/me", protect, getMe);

export default router;
