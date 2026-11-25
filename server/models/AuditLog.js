import mongoose from 'mongoose';
import crypto from 'crypto';

const auditLogSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
      default: () => crypto.randomUUID(),
      index: true,
    },
    user_id: {
      type: String,
      default: null,
      index: true,
    },
    event_type: {
      type: String,
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
    },
    resource_type: {
      type: String,
      default: null,
      index: true,
    },
    resource_id: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      default: 'success',
      index: true,
    },
    ip_address: {
      type: String,
      default: null,
    },
    user_agent: {
      type: String,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    created_at: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    collection: 'audit_logs',
    timestamps: { createdAt: 'created_at', updatedAt: false },
  }
);

auditLogSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
