import Message from '../models/Message.js';
import ChatLog from '../models/ChatLog.js';

// @desc    Get admin dashboard stats (messages + chat queries)
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getStats = async (req, res) => {
  try {
    const [totalMessages, unreadMessages, totalChats, recentMessages, recentChats] =
      await Promise.all([
        Message.countDocuments(),
        Message.countDocuments({ read: false }),
        ChatLog.countDocuments(),
        Message.find().sort({ createdAt: -1 }).limit(6),
        ChatLog.find().sort({ createdAt: -1 }).limit(6),
      ]);

    res.json({ totalMessages, unreadMessages, totalChats, recentMessages, recentChats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
