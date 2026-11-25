import mongoose from 'mongoose';

const systemSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    value: {
      type: String,
      required: true,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: 'system_settings',
    timestamps: { createdAt: false, updatedAt: 'updated_at' },
  }
);

systemSettingSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const SystemSetting = mongoose.model('SystemSetting', systemSettingSchema);
