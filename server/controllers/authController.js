import crypto from "crypto";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import { sendPasswordResetEmail } from "../services/mailService.js";

const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const hashResetToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const GENERIC_RESET_MESSAGE =
  "If an account exists for this email address, a password reset link has been sent.";

const validateNewPassword = (password) => {
  if (typeof password !== "string") {
    return "Password is required";
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters long";
  }

  if (password.length > 128) {
    return "Password must not exceed 128 characters";
  }

  const weakPasswords = new Set([
    "password",
    "password123",
    "12345678",
    "123456789",
    "1234567890",
    "qwerty123",
    "admin123",
    "admin@123",
    "welcome123",
  ]);

  if (weakPasswords.has(password.toLowerCase())) {
    return "Please choose a stronger password";
  }

  if (/^(.)\1+$/.test(password)) {
    return "Please choose a stronger password";
  }

  return null;
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

// @desc    Login a user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  res.json(req.user);
};

// @desc    Request admin password reset
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  const genericResponse = () =>
    res.status(200).json({
      message: GENERIC_RESET_MESSAGE,
    });

  try {
    const email =
      typeof req.body?.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";

    if (!email) {
      return genericResponse();
    }

    const user = await User.findOne({
      email,
      role: "admin",
    }).select("+passwordResetToken +passwordResetExpires");

    /*
     * Always return the same response for unknown/non-admin emails.
     * This prevents account enumeration.
     */
    if (!user) {
      return genericResponse();
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = hashResetToken(resetToken);

    user.passwordResetToken = resetTokenHash;
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);

    await user.save();

    const frontendUrl =
      process.env.FRONTEND_URL ||
      process.env.CLIENT_URL ||
      "http://localhost:5173";

    const resetUrl =
      `${frontendUrl.replace(/\/$/, "")}` +
      `/admin/reset-password?token=${encodeURIComponent(resetToken)}`;

    try {
      const emailSent = await sendPasswordResetEmail({
        email: user.email,
        resetUrl,
      });

      /*
       * If email delivery fails, invalidate the token immediately.
       * The generic response is still returned to the client.
       */
      if (!emailSent) {
        user.passwordResetToken = null;
        user.passwordResetExpires = null;
        await user.save();
      }
    } catch (mailError) {
      user.passwordResetToken = null;
      user.passwordResetExpires = null;
      await user.save();

      console.error(`Password reset email error: ${mailError.message}`);
    }

    return genericResponse();
  } catch (error) {
    /*
     * Do not expose internal errors or account existence information.
     */
    console.error(`Forgot password error: ${error.message}`);

    return genericResponse();
  }
};

// @desc    Reset admin password using a one-time token
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body || {};

    if (!token || !password || !confirmPassword) {
      return res.status(400).json({
        message: "Token, password and confirm password are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    const passwordError = validateNewPassword(password);

    if (passwordError) {
      return res.status(400).json({
        message: passwordError,
      });
    }

    const tokenHash = hashResetToken(token);

    const user = await User.findOne({
      role: "admin",
      passwordResetToken: tokenHash,
      passwordResetExpires: {
        $gt: new Date(),
      },
    })
      .select("+passwordResetToken +passwordResetExpires")
      .select("+password");

    if (!user) {
      return res.status(400).json({
        message: "This password reset link is invalid or has expired",
      });
    }

    /*
     * User schema pre-save middleware will securely hash the password.
     */
    user.password = password;

    /*
     * Invalidate JWTs issued before this password reset.
     */
    user.passwordChangedAt = new Date();

    /*
     * Single-use token:
     * clear it before saving so it cannot be reused.
     */
    user.passwordResetToken = null;
    user.passwordResetExpires = null;

    await user.save();

    return res.status(200).json({
      message: "Your password has been reset successfully. You can now log in.",
    });
  } catch (error) {
    console.error(`Reset password error: ${error.message}`);

    return res.status(500).json({
      message: "Unable to reset the password. Please try again later.",
    });
  }
};
