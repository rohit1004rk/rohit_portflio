import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    category: { type: String, default: 'AI/ML' },
    icon: { type: String, default: '💻' },
    overview: { type: String, required: true },
    thumbnail: { type: String, default: '' },
    description: [String],
    problem: { type: String, required: true },
    whatIBuilt: { type: String, required: true },
    result: { type: String, required: true },
    workflow: [String],
    limitations: [String],
    future: [String],
    metrics: [
      {
        label: String,
        value: String,
      },
    ],
    tech: [{ type: String }],
    // Optional real links. A button only renders when a URL exists.
    repoUrl: { type: String, default: '', trim: true },
    liveUrl: { type: String, default: '', trim: true },
    status: {
      type: String,
      enum: ['completed', 'in-progress', 'prototype', 'learning'],
      default: 'in-progress',
    },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Project', projectSchema);
