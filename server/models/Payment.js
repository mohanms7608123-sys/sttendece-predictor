import mongoose from 'mongoose';
import crypto from 'crypto';

const paymentSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      default: () => crypto.randomUUID(),
      index: true,
    },
    order_id: {
      type: String,
      required: true,
      index: true,
    },
    razorpay_order_id: {
      type: String,
      required: true,
      index: true,
    },
    razorpay_payment_id: {
      type: String,
      default: null,
    },
    razorpay_signature: {
      type: String,
      default: null,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      default: 'created',
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: 'payments',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

paymentSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Payment = mongoose.model('Payment', paymentSchema);
