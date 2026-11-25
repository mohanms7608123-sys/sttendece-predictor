import mongoose from 'mongoose';
import crypto from 'crypto';

const userRoleSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      default: () => crypto.randomUUID(),
      index: true,
    },
    user_id: {
      type: String,
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['student', 'canteen_owner', 'admin'],
      default: 'student',
      required: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: 'user_roles',
    timestamps: { createdAt: 'created_at', updatedAt: false },
  }
);

userRoleSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const UserRole = mongoose.model('UserRole', userRoleSchema);
