import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    issuer: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    certificateId: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    category: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "Certification",
    },

    completionDate: {
      type: String,
      trim: true,
      maxlength: 50,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    filename: {
      type: String,
      trim: true,
    },

    contentType: {
      type: String,
      required: true,
    },

    data: {
      type: Buffer,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Certificate", certificateSchema);
