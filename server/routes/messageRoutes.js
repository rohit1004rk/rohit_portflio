import express from 'express';
import {
  createMessage,
  getMessages,
  markMessageRead,
  deleteMessage,
} from '../controllers/messageController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validateMiddleware.js';

const router = express.Router();

const contactRules = {
  name: { required: true, label: 'Name', min: 2, max: 100 },
  email: { required: true, label: 'Email', type: 'email', max: 200 },
  subject: { required: true, label: 'Subject', min: 3, max: 200 },
  message: { required: true, label: 'Message', min: 10, max: 5000 },
};

router.route('/').post(validateBody(contactRules), createMessage).get(protect, admin, getMessages);
router.patch('/:id/read', protect, admin, markMessageRead);
router.delete('/:id', protect, admin, deleteMessage);

export default router;
