import mongoose from "mongoose";

const homeSchema = new mongoose.Schema(
  {
    hero: {
      eyebrow: {
        type: String,
        default: "FULL STACK + AI/ML DEVELOPER",
        trim: true,
      },
      name: {
        type: String,
        default: "Rohit Kumar",
        trim: true,
      },
      role: {
        type: String,
        default: "Full Stack + AI/ML",
        trim: true,
      },
      description: {
        type: String,
        default: "",
        trim: true,
      },
      primaryButtonText: {
        type: String,
        default: "View Projects",
        trim: true,
      },
      primaryButtonLink: {
        type: String,
        default: "/projects",
        trim: true,
      },
      secondaryButtonText: {
        type: String,
        default: "Contact Me",
        trim: true,
      },
      secondaryButtonLink: {
        type: String,
        default: "/contact",
        trim: true,
      },
    },

    codeShowcase: {
      enabled: {
        type: Boolean,
        default: true,
      },
      captionName: {
        type: String,
        default: "Rohit Kumar",
        trim: true,
      },
      captionRole: {
        type: String,
        default: "Full Stack + AI/ML Developer",
        trim: true,
      },
      snippets: {
        type: [
          {
            title: {
              type: String,
              trim: true,
            },
            code: {
              type: String,
              trim: true,
            },
          },
        ],
        default: [],
      },
    },

    featuredProjects: {
      enabled: {
        type: Boolean,
        default: true,
      },
      limit: {
        type: Number,
        default: 2,
        min: 1,
        max: 6,
      },
    },
  },
  {
    timestamps: true,
  },
);

const Home = mongoose.model("Home", homeSchema);

export default Home;
