import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.join(__dirname, ".env"),
});

const createOrUpdateAdmin = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in server/.env");
    }

    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
      throw new Error(
        "ADMIN_EMAIL or ADMIN_PASSWORD is missing in server/.env",
      );
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB connected");

    const email = process.env.ADMIN_EMAIL.toLowerCase().trim();
    const password = process.env.ADMIN_PASSWORD;

    let adminUser = await User.findOne({ email }).select("+password");

    if (adminUser) {
      adminUser.name = adminUser.name || "Rohit Kumar";
      adminUser.role = "admin";
      adminUser.password = password;

      await adminUser.save();

      console.log("✅ Existing admin account updated");
    } else {
      adminUser = await User.create({
        name: "Rohit Kumar",
        email,
        password,
        role: "admin",
      });

      console.log("✅ New admin account created");
    }

    console.log(`📧 Admin email: ${email}`);
    console.log("🔐 Admin password: configured from server/.env");
    console.log("🎉 Admin setup completed successfully");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Admin setup failed:", error.message);

    try {
      await mongoose.disconnect();
    } catch {}

    process.exit(1);
  }
};

createOrUpdateAdmin();
