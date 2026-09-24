import express from "express";

import {
  createMessage,
  getMessages,
  getMessageById,
  markMessageRead,
  markMessageUnread,
  markMessageImportant,
  markMessageNotImportant,
  archiveMessage,
  unarchiveMessage,
  markMessageReplied,
  markMessageNotReplied,
  deleteMessage,
} from "../controllers/messageController.js";

import { protect, admin } from "../middleware/authMiddleware.js";
import { validateBody } from "../middleware/validateMiddleware.js";

const router = express.Router();

const contactRules = {
  name: {
    required: true,
    label: "Name",
    min: 2,
    max: 100,
  },
  email: {
    required: true,
    label: "Email",
    type: "email",
    max: 200,
  },
  subject: {
    required: true,
    label: "Subject",
    min: 3,
    max: 200,
  },
  message: {
    required: true,
    label: "Message",
    min: 10,
    max: 5000,
  },
};

// Public contact form
// Admin-only message management
router
  .route("/")
  .post(validateBody(contactRules), createMessage)
  .get(protect, admin, getMessages);

// Message detail
router.get("/:id", protect, admin, getMessageById);

// Read / unread
router.patch("/:id/read", protect, admin, markMessageRead);
router.patch("/:id/unread", protect, admin, markMessageUnread);

// Important / not important
router.patch("/:id/important", protect, admin, markMessageImportant);

router.patch("/:id/not-important", protect, admin, markMessageNotImportant);

// Archive / unarchive
router.patch("/:id/archive", protect, admin, archiveMessage);
router.patch("/:id/unarchive", protect, admin, unarchiveMessage);

// Reply status
router.patch("/:id/replied", protect, admin, markMessageReplied);
router.patch("/:id/not-replied", protect, admin, markMessageNotReplied);

// Delete
router.delete("/:id", protect, admin, deleteMessage);

export default router;
