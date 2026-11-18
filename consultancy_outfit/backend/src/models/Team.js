import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Team name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      default: null,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Team = mongoose.model('Team', teamSchema);
export default Team;