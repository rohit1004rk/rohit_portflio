import mongoose from 'mongoose';

const chatLogSchema = new mongoose.Schema(
  {
    userMessage: { type: String, required: true, trim: true, maxlength: 2000 },
    botReply: { type: String, required: true, trim: true, maxlength: 4000 },
    sessionId: { type: String, default: 'anonymous' },
    userAgent: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('ChatLog', chatLogSchema);
