import mongoose from 'mongoose';
import crypto from 'crypto';

const pushSubscriptionSchema = new mongoose.Schema(
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
    endpoint: {
      type: String,
      required: true,
    },
    p256dh: {
      type: String,
      required: true,
    },
    auth: {
      type: String,
      required: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: 'push_subscriptions',
    timestamps: { createdAt: 'created_at', updatedAt: false },
  }
);

pushSubscriptionSchema.index({ user_id: 1, endpoint: 1 }, { unique: true });

pushSubscriptionSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const PushSubscription = mongoose.model('PushSubscription', pushSubscriptionSchema);
