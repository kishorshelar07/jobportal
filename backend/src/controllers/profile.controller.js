const path = require('path');
const fs = require('fs');
const JobSeekerProfile = require('../models/JobSeekerProfile');
const User = require('../models/User');
const { formatResponse } = require('../utils/formatResponse');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// ─── Get full profile ──────────────────────────────────
const getProfile = asyncHandler(async (req, res) => {
  const profile = await JobSeekerProfile.findOne({ userId: req.user._id })
    .populate('userId', 'name email profilePicture isVerified createdAt');

  if (!profile) throw new AppError('Profile not found.', 404);

  return formatResponse(res, {
    data: { profile },
  });
});

// ─── Get any user profile by ID (for recruiter view) ──
const getProfileById = asyncHandler(async (req, res) => {
  const profile = await JobSeekerProfile.findOne({ userId: req.params.userId })
    .populate('userId', 'name email profilePicture isVerified createdAt');

  if (!profile) throw new AppError('Profile not found.', 404);

  return formatResponse(res, { data: { profile } });
});

// ─── Update basic profile info ─────────────────────────
const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = [
    'headline', 'summary', 'experienceYears', 'currentSalary',
    'expectedSalary', 'noticePeriod', 'location', 'linkedinUrl',
    'githubUrl', 'portfolioUrl', 'isOpenToWork',
  ];

  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const profile = await JobSeekerProfile.findOneAndUpdate(
    { userId: req.user._id },
    { $set: updates },
    { new: true, runValidators: true }
  ).populate('userId', 'name email profilePicture');

  if (!profile) throw new AppError('Profile not found.', 404);

  return formatResponse(res, {
    message: 'Profile updated successfully.',
    data: { profile },
  });
});

// ─── Update user name ─────────────────────────────────
const updateUserName = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name || name.trim().length < 2) {
    throw new AppError('Name must be at least 2 characters.', 400);
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name: name.trim() },
    { new: true }
  );
  return formatResponse(res, { message: 'Name updated.', data: { name: user.name } });
});

// ─── Upload profile picture ────────────────────────────
const uploadProfilePicture = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('No image file uploaded.', 400);

  const fileUrl = `/uploads/profiles/${req.user.id}/${req.file.filename}`;

  // Delete old picture
  const user = await User.findById(req.user._id);
  if (user.profilePicture && user.profilePicture !== fileUrl) {
    const oldPath = path.join(process.cwd(), user.profilePicture);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }

  await User.findByIdAndUpdate(req.user._id, { profilePicture: fileUrl });

  return formatResponse(res, {
    message: 'Profile picture uploaded successfully.',
    data: { profilePicture: fileUrl },
  });
});

// ─── Upload resume ─────────────────────────────────────
const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('No PDF file uploaded.', 400);

  const fileUrl = `/uploads/resumes/${req.user.id}/${req.file.filename}`;

  // Delete old resume
  const profile = await JobSeekerProfile.findOne({ userId: req.user._id });
  if (profile?.resumeUrl) {
    const oldPath = path.join(process.cwd(), profile.resumeUrl);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }

  await JobSeekerProfile.findOneAndUpdate(
    { userId: req.user._id },
    { resumeUrl: fileUrl }
  );

  return formatResponse(res, {
    message: 'Resume uploaded successfully.',
    data: { resumeUrl: fileUrl },
  });
});

// ─── Work Experience CRUD ─────────────────────────────
const addExperience = asyncHandler(async (req, res) => {
  const profile = await JobSeekerProfile.findOneAndUpdate(
    { userId: req.user._id },
    { $push: { workExperience: req.body } },
    { new: true, runValidators: true }
  );
  return formatResponse(res, {
    message: 'Experience added.',
    data: { workExperience: profile.workExperience },
  });
});

const updateExperience = asyncHandler(async (req, res) => {
  const profile = await JobSeekerProfile.findOne({ userId: req.user._id });
  if (!profile) throw new AppError('Profile not found.', 404);

  const exp = profile.workExperience.id(req.params.expId);
  if (!exp) throw new AppError('Experience entry not found.', 404);

  Object.assign(exp, req.body);
  await profile.save();

  return formatResponse(res, {
    message: 'Experience updated.',
    data: { workExperience: profile.workExperience },
  });
});

const deleteExperience = asyncHandler(async (req, res) => {
  const profile = await JobSeekerProfile.findOneAndUpdate(
    { userId: req.user._id },
    { $pull: { workExperience: { _id: req.params.expId } } },
    { new: true }
  );
  return formatResponse(res, {
    message: 'Experience removed.',
    data: { workExperience: profile.workExperience },
  });
});

// ─── Education CRUD ────────────────────────────────────
const addEducation = asyncHandler(async (req, res) => {
  const profile = await JobSeekerProfile.findOneAndUpdate(
    { userId: req.user._id },
    { $push: { education: req.body } },
    { new: true, runValidators: true }
  );
  return formatResponse(res, {
    message: 'Education added.',
    data: { education: profile.education },
  });
});

const updateEducation = asyncHandler(async (req, res) => {
  const profile = await JobSeekerProfile.findOne({ userId: req.user._id });
  if (!profile) throw new AppError('Profile not found.', 404);

  const edu = profile.education.id(req.params.eduId);
  if (!edu) throw new AppError('Education entry not found.', 404);

  Object.assign(edu, req.body);
  await profile.save();

  return formatResponse(res, {
    message: 'Education updated.',
    data: { education: profile.education },
  });
});

const deleteEducation = asyncHandler(async (req, res) => {
  const profile = await JobSeekerProfile.findOneAndUpdate(
    { userId: req.user._id },
    { $pull: { education: { _id: req.params.eduId } } },
    { new: true }
  );
  return formatResponse(res, {
    message: 'Education removed.',
    data: { education: profile.education },
  });
});

// ─── Skills ────────────────────────────────────────────
const updateSkills = asyncHandler(async (req, res) => {
  const { skills } = req.body;
  if (!Array.isArray(skills)) throw new AppError('Skills must be an array.', 400);

  const profile = await JobSeekerProfile.findOneAndUpdate(
    { userId: req.user._id },
    { $set: { skills } },
    { new: true, runValidators: true }
  );
  return formatResponse(res, {
    message: 'Skills updated.',
    data: { skills: profile.skills },
  });
});

module.exports = {
  getProfile,
  getProfileById,
  updateProfile,
  updateUserName,
  uploadProfilePicture,
  uploadResume,
  addExperience,
  updateExperience,
  deleteExperience,
  addEducation,
  updateEducation,
  deleteEducation,
  updateSkills,
};
