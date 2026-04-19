const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  proficiency: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Expert'],
    default: 'Intermediate',
  },
}, { _id: true });

const educationSchema = new mongoose.Schema({
  degree: { type: String, required: true, trim: true },
  institution: { type: String, required: true, trim: true },
  fieldOfStudy: { type: String, trim: true },
  startYear: { type: Number },
  endYear: { type: Number },
  grade: { type: String, trim: true },
}, { _id: true, timestamps: false });

const workExperienceSchema = new mongoose.Schema({
  company: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true },
  location: { type: String, trim: true },
  startDate: { type: Date },
  endDate: { type: Date },
  isCurrent: { type: Boolean, default: false },
  description: { type: String, maxlength: 2000 },
}, { _id: true, timestamps: false });

const jobSeekerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    headline: {
      type: String,
      trim: true,
      maxlength: [200, 'Headline cannot exceed 200 characters'],
    },
    summary: {
      type: String,
      maxlength: [3000, 'Summary cannot exceed 3000 characters'],
    },
    experienceYears: {
      type: Number,
      min: 0,
      max: 50,
      default: 0,
    },
    currentSalary: { type: Number, min: 0 },
    expectedSalary: { type: Number, min: 0 },
    noticePeriod: {
      type: String,
      enum: ['Immediate', '15 days', '1 month', '2 months', '3 months', 'More than 3 months'],
      default: '1 month',
    },
    location: { type: String, trim: true },
    resumeUrl: { type: String, default: null },
    linkedinUrl: { type: String, trim: true },
    githubUrl: { type: String, trim: true },
    portfolioUrl: { type: String, trim: true },
    isOpenToWork: { type: Boolean, default: false },
    skills: [skillSchema],
    education: [educationSchema],
    workExperience: [workExperienceSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ───────────────────────────────────────────
jobSeekerProfileSchema.index({ userId: 1 });
jobSeekerProfileSchema.index({ isOpenToWork: 1 });
jobSeekerProfileSchema.index({ 'skills.name': 1 });
jobSeekerProfileSchema.index({ location: 1 });

// ─── Virtual: profileCompletion % ──────────────────────
jobSeekerProfileSchema.virtual('profileCompletion').get(function () {
  const fields = [
    !!this.headline,
    !!this.summary,
    !!this.resumeUrl,
    !!this.location,
    this.skills && this.skills.length > 0,
    this.education && this.education.length > 0,
    this.workExperience && this.workExperience.length > 0,
    !!this.linkedinUrl || !!this.githubUrl || !!this.portfolioUrl,
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
});

module.exports = mongoose.model('JobSeekerProfile', jobSeekerProfileSchema);
