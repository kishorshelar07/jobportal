const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [200, 'Company name cannot exceed 200 characters'],
    },
    logoUrl: { type: String, default: null },
    website: { type: String, trim: true },
    industry: {
      type: String,
      enum: [
        'Technology', 'Finance', 'Healthcare', 'Education', 'E-Commerce',
        'Manufacturing', 'Consulting', 'Media & Entertainment', 'Real Estate',
        'Logistics', 'Automotive', 'Retail', 'Telecommunications', 'Other',
      ],
      default: 'Technology',
    },
    size: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
      default: '11-50',
    },
    location: { type: String, trim: true },
    description: {
      type: String,
      maxlength: [5000, 'Company description cannot exceed 5000 characters'],
    },
    isVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

companySchema.index({ recruiterId: 1 });
companySchema.index({ isVerified: 1 });
companySchema.index({ industry: 1 });
companySchema.index({ name: 'text' });

module.exports = mongoose.model('Company', companySchema);
