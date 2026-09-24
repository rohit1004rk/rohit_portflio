import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      message: "Not authorized, no token",
    });
  }

  try {
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured.");
      return res.status(500).json({
        message: "Authentication service is not configured",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id)
      .select("-password")
      .select("+passwordChangedAt");

    if (!user) {
      return res.status(401).json({
        message: "Not authorized, user not found",
      });
    }

    /*
     * If the password was changed/reset after this JWT was issued,
     * invalidate the old JWT.
     *
     * JWT `iat` is expressed in seconds.
     * passwordChangedAt is stored as a JavaScript Date.
     */
    if (
      user.passwordChangedAt &&
      decoded.iat &&
      user.passwordChangedAt.getTime() / 1000 > decoded.iat
    ) {
      return res.status(401).json({
        message: "Session expired because the password was changed",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Not authorized, token failed",
    });
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      message: "Not authorized as admin",
    });
  }
};
