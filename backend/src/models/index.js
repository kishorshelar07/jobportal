const mongoose = require('mongoose');

// ─── SavedJob ──────────────────────────────────────────
const savedJobSchema = new mongoose.Schema(
  {
    jobSeekerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    savedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

savedJobSchema.index({ jobSeekerId: 1, jobId: 1 }, { unique: true });
savedJobSchema.index({ jobSeekerId: 1 });

const SavedJob = mongoose.model('SavedJob', savedJobSchema);

// ─── Notification ──────────────────────────────────────
const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'status_change',
        'new_matching_job',
        'application_viewed',
        'application_received',
        'job_deadline',
        'system',
      ],
      required: true,
    },
    title: { type: String, required: true, maxlength: 200 },
    message: { type: String, required: true, maxlength: 500 },
    isRead: { type: Boolean, default: false },
    referenceId: { type: mongoose.Schema.Types.ObjectId },
    referenceType: {
      type: String,
      enum: ['Job', 'Application', 'User', 'Company'],
    },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

// ─── RefreshToken ──────────────────────────────────────
const refreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    isRevoked: { type: Boolean, default: false },
    createdByIp: { type: String },
  },
  { timestamps: true }
);

refreshTokenSchema.index({ userId: 1 });
refreshTokenSchema.index({ token: 1 });
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

// ─── EmailVerification ─────────────────────────────────
const emailVerificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    otp: { type: String, required: true },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 min
    },
    attempts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

emailVerificationSchema.index({ userId: 1 });
emailVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const EmailVerification = mongoose.model('EmailVerification', emailVerificationSchema);

// ─── PasswordReset ─────────────────────────────────────
const passwordResetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    token: { type: String, required: true, unique: true },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 30 * 60 * 1000), // 30 min
    },
    isUsed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

passwordResetSchema.index({ token: 1 });
passwordResetSchema.index({ userId: 1 });
passwordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const PasswordReset = mongoose.model('PasswordReset', passwordResetSchema);

module.exports = { SavedJob, Notification, RefreshToken, EmailVerification, PasswordReset };
