import mongoose from 'mongoose';
import crypto from 'crypto';

const orderSchema = new mongoose.Schema(
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
    token_number: {
      type: Number,
      required: true,
      index: true,
    },
    time_slot_id: {
      type: String,
      required: true,
      index: true,
    },
    total_amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['placed', 'accepted', 'preparing', 'ready', 'collected', 'cancelled'],
      default: 'placed',
      index: true,
    },
    notes: {
      type: String,
      default: null,
    },
    created_at: {
      type: Date,
      default: Date.now,
      index: true,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: 'orders',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

orderSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Order = mongoose.model('Order', orderSchema);
