import mongoose from "mongoose";
import Message from "../models/Message.js";
import { sendContactNotification } from "../services/mailService.js";

const messageSelect =
  "name email subject message category read important status archived replied emailDelivery createdAt updatedAt";

/**
 * Keep the workflow status consistent with the independent
 * archived / replied / read flags.
 *
 * Priority:
 * archived > replied > read > new
 */
const getWorkflowStatus = (message) => {
  if (message.archived) {
    return "archived";
  }

  if (message.replied) {
    return "replied";
  }

  if (message.read) {
    return "read";
  }

  return "new";
};

export const createMessage = async (req, res) => {
  try {
    const { name, email, subject, message, category } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const newMessage = await Message.create({
      name,
      email,
      subject,
      message,
      category: category || "General",
      emailDelivery: {
        status: "pending",
      },
    });

    const notified = await sendContactNotification(newMessage);

    if (notified) {
      newMessage.emailDelivery = {
        status: "sent",
        sentAt: new Date(),
        error: null,
      };
    } else {
      newMessage.emailDelivery = {
        status: "failed",
        sentAt: null,
        error: "Email notification failed or SMTP is not configured.",
      };
    }

    await newMessage.save();

    return res.status(201).json({
      success: true,
      id: newMessage._id,
      emailed: notified,
      message: "Message sent successfully. I will get back to you soon!",
    });
  } catch (error) {
    console.error("Create message error:", error);

    return res.status(500).json({
      message: "Failed to send message. Please try again later.",
    });
  }
};

export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find().select(messageSelect).sort({
      archived: 1,
      important: -1,
      read: 1,
      createdAt: -1,
    });

    return res.json(messages);
  } catch (error) {
    console.error("Get messages error:", error);

    return res.status(500).json({
      message: "Failed to fetch messages",
    });
  }
};

export const getMessageById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid message ID",
      });
    }

    const message = await Message.findById(id).select(messageSelect);

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    return res.json(message);
  } catch (error) {
    console.error("Get message by ID error:", error);

    return res.status(500).json({
      message: "Failed to fetch message",
    });
  }
};

export const markMessageRead = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid message ID",
      });
    }

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    message.read = true;
    message.status = getWorkflowStatus(message);

    await message.save();

    return res.json(message);
  } catch (error) {
    console.error("Mark message read error:", error);

    return res.status(500).json({
      message: "Failed to update message",
    });
  }
};

export const markMessageUnread = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid message ID",
      });
    }

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    message.read = false;
    message.status = getWorkflowStatus(message);

    await message.save();

    return res.json(message);
  } catch (error) {
    console.error("Mark message unread error:", error);

    return res.status(500).json({
      message: "Failed to update message",
    });
  }
};

export const markMessageImportant = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid message ID",
      });
    }

    const message = await Message.findByIdAndUpdate(
      id,
      {
        important: true,
      },
      {
        new: true,
        runValidators: true,
      },
    ).select(messageSelect);

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    return res.json(message);
  } catch (error) {
    console.error("Mark message important error:", error);

    return res.status(500).json({
      message: "Failed to update message",
    });
  }
};

export const markMessageNotImportant = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid message ID",
      });
    }

    const message = await Message.findByIdAndUpdate(
      id,
      {
        important: false,
      },
      {
        new: true,
        runValidators: true,
      },
    ).select(messageSelect);

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    return res.json(message);
  } catch (error) {
    console.error("Mark message not important error:", error);

    return res.status(500).json({
      message: "Failed to update message",
    });
  }
};

export const archiveMessage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid message ID",
      });
    }

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    message.archived = true;
    message.status = "archived";

    await message.save();

    return res.json(message);
  } catch (error) {
    console.error("Archive message error:", error);

    return res.status(500).json({
      message: "Failed to archive message",
    });
  }
};

export const unarchiveMessage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid message ID",
      });
    }

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    message.archived = false;
    message.status = getWorkflowStatus(message);

    await message.save();

    return res.json(message);
  } catch (error) {
    console.error("Unarchive message error:", error);

    return res.status(500).json({
      message: "Failed to unarchive message",
    });
  }
};

export const markMessageReplied = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid message ID",
      });
    }

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    message.replied = true;
    message.read = true;
    message.status = getWorkflowStatus(message);

    await message.save();

    return res.json(message);
  } catch (error) {
    console.error("Mark message replied error:", error);

    return res.status(500).json({
      message: "Failed to update reply status",
    });
  }
};

export const markMessageNotReplied = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid message ID",
      });
    }

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    message.replied = false;
    message.status = getWorkflowStatus(message);

    await message.save();

    return res.json(message);
  } catch (error) {
    console.error("Mark message not replied error:", error);

    return res.status(500).json({
      message: "Failed to update reply status",
    });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid message ID",
      });
    }

    const message = await Message.findByIdAndDelete(id);

    if (!message) {
      return res.status(404).json({
        message: "Message not found",
      });
    }

    return res.json({
      message: "Message removed",
    });
  } catch (error) {
    console.error("Delete message error:", error);

    return res.status(500).json({
      message: "Failed to delete message",
    });
  }
};
