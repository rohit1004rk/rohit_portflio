import mongoose from "mongoose";
import validator from "validator";

const messageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: 100,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },

    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
      maxlength: 200,
    },

    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: 5000,
    },

    // Optional contact category.
    // Existing contact forms that do not send a category
    // will automatically use "General".
    category: {
      type: String,
      trim: true,
      maxlength: 50,
      default: "General",
    },

    // Message has been opened/read by admin
    read: {
      type: Boolean,
      default: false,
    },

    // High-priority message flag
    important: {
      type: Boolean,
      default: false,
    },

    // Persistent message workflow status
    status: {
      type: String,
      enum: ["new", "read", "replied", "archived"],
      default: "new",
    },

    // Message can be archived without deleting it
    archived: {
      type: Boolean,
      default: false,
    },

    // Tracks whether the admin has replied to the visitor
    replied: {
      type: Boolean,
      default: false,
    },

    // Email notification delivery tracking
    emailDelivery: {
      status: {
        type: String,
        enum: ["pending", "sent", "failed"],
        default: "pending",
      },
      sentAt: {
        type: Date,
        default: null,
      },
      error: {
        type: String,
        default: null,
        maxlength: 1000,
      },
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Message", messageSchema);
