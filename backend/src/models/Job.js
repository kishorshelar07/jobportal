const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [200, 'Job title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      maxlength: [10000, 'Description cannot exceed 10000 characters'],
    },
    requirements: {
      type: String,
      maxlength: [5000, 'Requirements cannot exceed 5000 characters'],
    },
    responsibilities: {
      type: String,
      maxlength: [5000, 'Responsibilities cannot exceed 5000 characters'],
    },
    jobType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship'],
      required: true,
    },
    workMode: {
      type: String,
      enum: ['remote', 'onsite', 'hybrid'],
      required: true,
    },
    location: {
      type: String,
      trim: true,
    },
    minSalary: { type: Number, min: 0 },
    maxSalary: { type: Number, min: 0 },
    salaryDisclosed: { type: Boolean, default: true },
    experienceMin: { type: Number, min: 0, default: 0 },
    experienceMax: { type: Number, min: 0 },
    skillsRequired: [{ type: String, trim: true }],
    openings: {
      type: Number,
      min: 1,
      default: 1,
    },
    status: {
      type: String,
      enum: ['active', 'closed', 'draft'],
      default: 'draft',
    },
    deadline: { type: Date },
    viewsCount: { type: Number, default: 0 },
    applicationsCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ───────────────────────────────────────────
jobSchema.index({ recruiterId: 1 });
jobSchema.index({ companyId: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ jobType: 1 });
jobSchema.index({ workMode: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ skillsRequired: 1 });
jobSchema.index({ deadline: 1 });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ title: 'text', description: 'text', skillsRequired: 'text' });

// ─── Virtual: isExpired ────────────────────────────────
jobSchema.virtual('isExpired').get(function () {
  if (!this.deadline) return false;
  return new Date() > new Date(this.deadline);
});

// ─── Virtual: daysRemaining ────────────────────────────
jobSchema.virtual('daysRemaining').get(function () {
  if (!this.deadline) return null;
  const diff = new Date(this.deadline) - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
});

module.exports = mongoose.model('Job', jobSchema);
