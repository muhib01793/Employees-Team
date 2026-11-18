import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      default: '',
    },
    logo: {
      type: String,
      default: '',
    },
    website: {
      type: String,
      default: '',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        role: {
          type: String,
          enum: ['admin', 'member', 'guest'],
          default: 'member',
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Generate slug from name before saving
companySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+$/, '');
  }
  next();
});

const Company = mongoose.model('Company', companySchema);
export default Company;