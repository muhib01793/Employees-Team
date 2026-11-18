import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      default: '',
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    uploadedBy: {
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
    isPublic: {
      type: Boolean,
      default: false,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Document = mongoose.model('Document', documentSchema);
export default Document;