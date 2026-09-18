import mongoose from "mongoose";

const chatLogSchema = new mongoose.Schema(
  {
    userMessage: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    botReply: {
      type: String,
      required: true,
      trim: true,
      maxlength: 4000,
    },

    sessionId: {
      type: String,
      default: "anonymous",
      trim: true,
      maxlength: 100,
    },

    userAgent: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true },
);

export default mongoose.model("ChatLog", chatLogSchema);
