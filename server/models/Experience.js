import mongoose from "mongoose";

const experienceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    company: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    type: {
      type: String,
      default: "Experience",
      trim: true,
      maxlength: 100,
    },

    location: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
    },

    startDate: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },

    endDate: {
      type: String,
      default: "",
      trim: true,
      maxlength: 50,
    },

    current: {
      type: Boolean,
      default: false,
    },

    domain: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200,
    },

    duration: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    learnings: [
      {
        type: String,
        trim: true,
      },
    ],

    technologies: [
      {
        type: String,
        trim: true,
      },
    ],

    certificateId: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
    },

    grade: {
      type: String,
      default: "",
      trim: true,
      maxlength: 50,
    },

    icon: {
      type: String,
      default: "💼",
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

export default mongoose.model("Experience", experienceSchema);
