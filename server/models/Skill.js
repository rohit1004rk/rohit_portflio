import mongoose from "mongoose";

const skillSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    icon: {
      type: String,
      trim: true,
      default: "🛠️",
      maxlength: 100,
    },

    items: {
      type: [String],
      default: [],
    },

    order: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },

    visible: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

skillSchema.index({
  visible: 1,
  order: 1,
});

const Skill = mongoose.models.Skill || mongoose.model("Skill", skillSchema);

export default Skill;
