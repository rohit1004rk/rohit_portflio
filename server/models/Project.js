import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    category: {
      type: String,
      default: "AI/ML",
    },

    icon: {
      type: String,
      default: "💻",
    },

    overview: {
      type: String,
      required: true,
    },

    thumbnail: {
      type: String,
      default: "",
    },

    description: [String],

    problem: {
      type: String,
      required: true,
    },

    whatIBuilt: {
      type: String,
      required: true,
    },

    result: {
      type: String,
      required: true,
    },

    workflow: [String],

    limitations: [String],

    future: [String],

    metrics: [
      {
        label: {
          type: String,
        },
        value: {
          type: String,
        },
      },
    ],

    tech: [
      {
        type: String,
      },
    ],

    repoUrl: {
      type: String,
      default: "",
      trim: true,
    },

    liveUrl: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["completed", "in-progress", "prototype", "learning"],
      default: "in-progress",
    },

    /**
     * Controls whether this project is enabled on the public portfolio.
     * Existing projects automatically remain enabled because the default
     * value is true.
     */
    enabled: {
      type: Boolean,
      default: true,
    },

    /**
     * Controls whether this project appears in the homepage featured
     * projects selection.
     */
    featured: {
      type: Boolean,
      default: false,
    },

    /**
     * Actual persisted sequence/order of the project.
     * This remains separate from displayNumber.
     */
    order: {
      type: Number,
      default: 0,
    },

    /**
     * Optional custom number displayed in the UI.
     * It is intentionally independent from `order`.
     *
     * Example:
     * order = 3
     * displayNumber = 01
     */
    displayNumber: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

const Project = mongoose.model("Project", projectSchema);

export default Project;
