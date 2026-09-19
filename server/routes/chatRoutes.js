import express from 'express';
import { createChat, getChatLogs, deleteChatLog } from '../controllers/chatController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validateMiddleware.js';

const router = express.Router();

const chatRules = {
  message: { required: true, label: 'Message', min: 1, max: 1000 },
  sessionId: { required: false, label: 'Session', max: 100 },
};

router.route('/').post(validateBody(chatRules), createChat).get(protect, admin, getChatLogs);
router.delete('/:id', protect, admin, deleteChatLog);

export default router;
