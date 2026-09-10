import express from 'express';
import {
  createMessage,
  getMessages,
  markMessageRead,
  deleteMessage,
} from '../controllers/messageController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(createMessage).get(protect, admin, getMessages);
router.patch('/:id/read', protect, admin, markMessageRead);
router.delete('/:id', protect, admin, deleteMessage);

export default router;
