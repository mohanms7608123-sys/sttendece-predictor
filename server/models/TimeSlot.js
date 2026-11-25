import mongoose from 'mongoose';
import crypto from 'crypto';

const timeSlotSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      default: () => crypto.randomUUID(),
      index: true,
    },
    start_time: {
      type: String,
      required: true,
    },
    end_time: {
      type: String,
      required: true,
    },
    max_orders: {
      type: Number,
      default: 50,
    },
    current_orders: {
      type: Number,
      default: 0,
    },
    is_active: {
      type: Boolean,
      default: true,
      index: true,
    },
    slot_date: {
      type: String,
      required: true,
      index: true, // format: YYYY-MM-DD
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
    collection: 'time_slots',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

timeSlotSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const TimeSlot = mongoose.model('TimeSlot', timeSlotSchema);
