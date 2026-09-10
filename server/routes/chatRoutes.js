import express from 'express';
import { createChat, getChatLogs, deleteChatLog } from '../controllers/chatController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(createChat).get(protect, admin, getChatLogs);
router.delete('/:id', protect, admin, deleteChatLog);

export default router;
