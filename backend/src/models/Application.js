const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['applied', 'screening', 'interview', 'offer', 'rejected', 'hired'],
    required: true,
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  note: { type: String, maxlength: 500 },
  changedAt: { type: Date, default: Date.now },
}, { _id: true });

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    jobSeekerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resumeUrl: {
      type: String,
      required: [true, 'Resume is required for application'],
    },
    coverLetter: {
      type: String,
      maxlength: [500, 'Cover letter cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: ['applied', 'screening', 'interview', 'offer', 'rejected', 'hired'],
      default: 'applied',
    },
    statusHistory: [statusHistorySchema],
    isWithdrawn: { type: Boolean, default: false },
    viewedByRecruiter: { type: Boolean, default: false },
    appliedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ───────────────────────────────────────────
applicationSchema.index({ jobId: 1 });
applicationSchema.index({ jobSeekerId: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ appliedAt: -1 });
// Prevent duplicate applications
applicationSchema.index({ jobId: 1, jobSeekerId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
