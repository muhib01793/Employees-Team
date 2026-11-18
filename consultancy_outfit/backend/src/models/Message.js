import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      default: null,
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      default: null,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null means team/group message
    },
    content: {
      type: String,
      default: '',
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'file', 'video', 'audio'],
      default: 'text',
    },
    fileUrl: {
      type: String,
      default: '',
    },
    fileName: {
      type: String,
      default: '',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

messageSchema.index({ company: 1, team: 1, createdAt: -1 });
messageSchema.index({ receiver: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);
export default Message;