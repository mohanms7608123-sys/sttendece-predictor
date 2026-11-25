import mongoose from 'mongoose';
import crypto from 'crypto';

const ratingSchema = new mongoose.Schema(
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
    menu_item_id: {
      type: String,
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
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
    collection: 'ratings',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

ratingSchema.index({ user_id: 1, menu_item_id: 1 }, { unique: true });

ratingSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Rating = mongoose.model('Rating', ratingSchema);
