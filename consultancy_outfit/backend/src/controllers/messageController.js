import Message from '../models/Message.js';
import User from '../models/User.js';
import asyncHandler from 'express-async-handler';

// @desc    Get messages for DM or company
// @route   GET /api/messages
// @access  Private
export const getMessages = asyncHandler(async (req, res) => {
  const { companyId, teamId, receiverId, limit = 100 } = req.query;

  let query = { deletedAt: null };

  if (receiverId) {
    // 1-on-1 direct conversation between logged-in user and receiver
    query = {
      deletedAt: null,
      $or: [
        { sender: req.user.id, receiver: receiverId },
        { sender: receiverId, receiver: req.user.id },
      ],
    };
  } else if (teamId) {
    query.team = teamId;
  } else if (companyId) {
    query.company = companyId;
  }

  const messages = await Message.find(query)
    .populate('sender', 'name email avatar designation')
    .populate('receiver', 'name email avatar designation')
    .sort({ createdAt: 1 })
    .limit(parseInt(limit));

  res.status(200).json({ success: true, messages });
});

// @desc    Send message
// @route   POST /api/messages
// @access  Private
export const sendMessage = asyncHandler(async (req, res) => {
  const { companyId, teamId, receiverId, content, messageType, fileUrl, fileName, replyTo } = req.body;

  if (!content && !fileUrl) {
    res.status(400);
    throw new Error('Message content or attachment is required');
  }

  const message = await Message.create({
    sender: req.user.id,
    company: companyId || null,
    team: teamId || null,
    receiver: receiverId || null,
    content: content || '',
    messageType: messageType || (fileUrl ? 'file' : 'text'),
    fileUrl: fileUrl || '',
    fileName: fileName || '',
    replyTo: replyTo || null,
  });

  const populatedMessage = await Message.findById(message._id)
    .populate('sender', 'name email avatar designation')
    .populate('receiver', 'name email avatar designation');

  // Socket notification
  const io = req.app.get('io');
  if (io) {
    if (receiverId) {
      io.to(`user_${receiverId}`).emit('receive_message', populatedMessage);
      io.to(`user_${req.user.id}`).emit('receive_message', populatedMessage);
    }
    if (companyId) {
      io.to(`company_${companyId}`).emit('receive_message', populatedMessage);
    }
  }

  res.status(201).json({ success: true, message: populatedMessage });
});

// @desc    Get conversations
// @route   GET /api/messages/conversations
// @access  Private
export const getConversations = asyncHandler(async (req, res) => {
  // Return all users as potential chat contacts
  const users = await User.find({ _id: { $ne: req.user.id } })
    .select('name email designation status avatar lastSeen')
    .sort({ status: -1, name: 1 });

  res.status(200).json({ success: true, conversations: users });
});

// @desc    Mark message as read
// @route   PUT /api/messages/:id/read
// @access  Private
export const markAsRead = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id);

  if (!message) {
    res.status(404);
    throw new Error('Message not found');
  }

  message.isRead = true;
  await message.save();

  res.status(200).json({ success: true, message });
});

// @desc    Delete message
// @route   DELETE /api/messages/:id
// @access  Private
export const deleteMessage = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id);

  if (!message) {
    res.status(404);
    throw new Error('Message not found');
  }

  if (message.sender.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to delete this message');
  }

  message.deletedAt = new Date();
  message.content = 'This message was deleted';
  await message.save();

  res.status(200).json({ success: true, message: 'Message deleted' });
});
