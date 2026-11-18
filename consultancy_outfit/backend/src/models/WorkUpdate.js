import mongoose from 'mongoose';

const workUpdateSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task/Work title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Work description is required'],
    },
    status: {
      type: String,
      enum: ['In Progress', 'Completed', 'Under Review', 'Pending'],
      default: 'In Progress',
    },
    category: {
      type: String,
      default: 'General Work',
    },
    link: {
      type: String,
      default: '',
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const WorkUpdate = mongoose.model('WorkUpdate', workUpdateSchema);
export default WorkUpdate;
