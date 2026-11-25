import mongoose from 'mongoose';
import crypto from 'crypto';

const rateLimitSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      default: () => crypto.randomUUID(),
      index: true,
    },
    identifier: {
      type: String,
      required: true,
      index: true,
    },
    endpoint: {
      type: String,
      required: true,
      index: true,
    },
    request_count: {
      type: Number,
      default: 1,
    },
    window_start: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    collection: 'rate_limits',
    timestamps: false,
  }
);

rateLimitSchema.index({ identifier: 1, endpoint: 1 }, { unique: true });

rateLimitSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const RateLimit = mongoose.model('RateLimit', rateLimitSchema);
