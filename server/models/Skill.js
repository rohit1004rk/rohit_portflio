import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema(
  {
    category: { type: String, required: true, trim: true },
    icon: { type: String, default: '🛠️' },
    items: [{ type: String }],
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Skill', skillSchema);
