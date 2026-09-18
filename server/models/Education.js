import mongoose from "mongoose";

const educationSchema = new mongoose.Schema(
  {
    years: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    place: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    location: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200,
    },

    detail: {
      type: String,
      default: "",
      trim: true,
      maxlength: 300,
    },

    cgpa: {
      type: String,
      default: "",
      trim: true,
      maxlength: 50,
    },

    percentage: {
      type: String,
      default: "",
      trim: true,
      maxlength: 50,
    },

    icon: {
      type: String,
      default: "🎓",
      trim: true,
      maxlength: 20,
    },

    order: {
      type: Number,
      default: 0,
      min: 0,
    },

    visible: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Education", educationSchema);
