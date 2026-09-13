import mongoose from 'mongoose';
import validator from 'validator';

const messageSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 100 },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    subject: { type: String, required: [true, 'Subject is required'], trim: true, maxlength: 200 },
    message: { type: String, required: [true, 'Message is required'], trim: true, maxlength: 5000 },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Message', messageSchema);
