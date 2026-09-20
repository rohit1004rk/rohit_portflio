import mongoose from "mongoose";

const aboutCardSchema = new mongoose.Schema(
  {
    icon: {
      type: String,
      default: "✦",
      trim: true,
    },

    title: {
      type: String,
      default: "",
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    enabled: {
      type: Boolean,
      default: true,
    },

    order: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: true },
);

const aboutSchema = new mongoose.Schema(
  {
    hero: {
      enabled: {
        type: Boolean,
        default: true,
      },

      eyebrow: {
        type: String,
        default: "ABOUT",
        trim: true,
      },

      title: {
        type: String,
        default: "Turning problems into software",
        trim: true,
      },

      lead: {
        type: String,
        default: "",
        trim: true,
      },
    },

    introduction: {
      enabled: {
        type: Boolean,
        default: true,
      },

      paragraph1: {
        type: String,
        default: "",
        trim: true,
      },

      paragraph2: {
        type: String,
        default: "",
        trim: true,
      },

      paragraph3: {
        type: String,
        default: "",
        trim: true,
      },
    },

    focusCards: {
      enabled: {
        type: Boolean,
        default: true,
      },

      items: {
        type: [aboutCardSchema],
        default: [],
      },
    },

    visibility: {
      hero: {
        type: Boolean,
        default: true,
      },

      introduction: {
        type: Boolean,
        default: true,
      },

      focusCards: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  },
);

const About = mongoose.model("About", aboutSchema);

export default About;
