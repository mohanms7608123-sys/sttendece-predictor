import mongoose from 'mongoose';
import crypto from 'crypto';

const menuItemSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      default: () => crypto.randomUUID(),
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    image_url: {
      type: String,
      default: null,
    },
    prep_time: {
      type: Number,
      default: 10,
    },
    is_available: {
      type: Boolean,
      default: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    is_veg: {
      type: Boolean,
      default: false,
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
    collection: 'menu_items',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

menuItemSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const MenuItem = mongoose.model('MenuItem', menuItemSchema);
