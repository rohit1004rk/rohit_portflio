import mongoose from "mongoose";

const skillSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      trim: true,
    },

    icon: {
      type: String,
      default: "🛠️",
    },

    items: [
      {
        type: String,
        trim: true,
      },
    ],

    order: {
      type: Number,
      default: 0,
    },

    // Controls whether this skill category appears
    // on the public Skills page.
    // Existing MongoDB records without this field
    // are treated as visible by the frontend.
    visible: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Skill", skillSchema);
