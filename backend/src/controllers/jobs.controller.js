const Job = require('../models/Job');
const Application = require('../models/Application');
const { SavedJob } = require('../models/index');
const JobSeekerProfile = require('../models/JobSeekerProfile');
const { formatResponse } = require('../utils/formatResponse');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { notifyNewApplication } = require('../services/notification.service');

// ─── Search / List Jobs ────────────────────────────────
const getJobs = asyncHandler(async (req, res) => {
  const {
    search, location, jobType, workMode, minSalary, maxSalary,
    experienceMin, experienceMax, industry, skills,
    datePosted, sort = 'createdAt', page = 1, limit = 10,
  } = req.query;

  const query = { status: 'active' };

  // Text search
  if (search) {
    query.$text = { $search: search };
  }

  if (location) query.location = { $regex: location, $options: 'i' };
  if (jobType) query.jobType = jobType;
  if (workMode) query.workMode = workMode;
  if (minSalary) query.minSalary = { $gte: parseInt(minSalary) };
  if (maxSalary) query.maxSalary = { $lte: parseInt(maxSalary) };
  if (experienceMin !== undefined) query.experienceMin = { $gte: parseInt(experienceMin) };
  if (experienceMax !== undefined) query.experienceMax = { $lte: parseInt(experienceMax) };
  if (skills) {
    const skillsArr = skills.split(',').map((s) => s.trim());
    query.skillsRequired = { $in: skillsArr };
  }

  // Date posted filter
  if (datePosted) {
    const now = new Date();
    const cutoffs = { today: 1, week: 7, month: 30 };
    const days = cutoffs[datePosted];
    if (days) {
      query.createdAt = { $gte: new Date(now - days * 24 * 60 * 60 * 1000) };
    }
  }

  // Sort
  const sortOptions = {
    createdAt: { createdAt: -1 },
    salary_high: { maxSalary: -1 },
    salary_low: { minSalary: 1 },
    relevance: search ? { score: { $meta: 'textScore' } } : { createdAt: -1 },
  };
  const sortBy = sortOptions[sort] || { createdAt: -1 };

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [jobs, total] = await Promise.all([
    Job.find(query)
      .populate('companyId', 'name logoUrl industry location isVerified')
      .sort(sortBy)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Job.countDocuments(query),
  ]);

  // Calculate skill match if user is logged in
  let userSkills = [];
  if (req.user && req.user.role === 'jobseeker') {
    const profile = await JobSeekerProfile.findOne({ userId: req.user._id }).select('skills');
    userSkills = profile?.skills?.map((s) => s.name.toLowerCase()) || [];
  }

  // Get saved job IDs for logged-in user
  let savedJobIds = [];
  if (req.user) {
    const saved = await SavedJob.find({ jobSeekerId: req.user._id }).select('jobId');
    savedJobIds = saved.map((s) => s.jobId.toString());
  }

  const enrichedJobs = jobs.map((job) => {
    const requiredSkills = (job.skillsRequired || []).map((s) => s.toLowerCase());
    const matchCount = userSkills.filter((s) => requiredSkills.includes(s)).length;
    const skillMatch = requiredSkills.length > 0
      ? Math.round((matchCount / requiredSkills.length) * 100)
      : 0;

    return {
      ...job,
      skillMatch,
      isSaved: savedJobIds.includes(job._id.toString()),
    };
  });

  return formatResponse(res, {
    data: { jobs: enrichedJobs },
    meta: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    },
  });
});

// ─── Get Single Job ────────────────────────────────────
const getJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id)
    .populate('companyId', 'name logoUrl industry location description website size isVerified')
    .populate('recruiterId', 'name email');

  if (!job) throw new AppError('Job not found.', 404);

  // Increment view count (non-blocking)
  Job.findByIdAndUpdate(req.params.id, { $inc: { viewsCount: 1 } }).exec();

  // Check if saved/applied
  let isSaved = false;
  let hasApplied = false;

  if (req.user && req.user.role === 'jobseeker') {
    const [saved, applied] = await Promise.all([
      SavedJob.findOne({ jobSeekerId: req.user._id, jobId: job._id }),
      Application.findOne({ jobSeekerId: req.user._id, jobId: job._id }),
    ]);
    isSaved = !!saved;
    hasApplied = !!applied && !applied.isWithdrawn;
  }

  // Similar jobs
  const similarJobs = await Job.find({
    _id: { $ne: job._id },
    status: 'active',
    $or: [
      { companyId: job.companyId },
      { jobType: job.jobType },
      { skillsRequired: { $in: job.skillsRequired } },
    ],
  })
    .populate('companyId', 'name logoUrl')
    .limit(4)
    .lean();

  return formatResponse(res, {
    data: { job, isSaved, hasApplied, similarJobs },
  });
});

// ─── Apply to Job ──────────────────────────────────────
const applyToJob = asyncHandler(async (req, res) => {
  const { coverLetter } = req.body;
  const jobId = req.params.id;

  const job = await Job.findById(jobId).populate('companyId', 'name');
  if (!job) throw new AppError('Job not found.', 404);
  if (job.status !== 'active') throw new AppError('This job is no longer accepting applications.', 400);
  if (job.deadline && new Date() > job.deadline) {
    throw new AppError('Application deadline has passed.', 400);
  }

  // Check duplicate application
  const existing = await Application.findOne({ jobId, jobSeekerId: req.user._id });
  if (existing && !existing.isWithdrawn) {
    throw new AppError('You have already applied for this job.', 409);
  }

  // Determine resume URL
  let resumeUrl;
  if (req.file) {
    resumeUrl = `/uploads/resumes/${req.user.id}/applications/${req.file.filename}`;
  } else {
    const profile = await JobSeekerProfile.findOne({ userId: req.user._id });
    if (!profile?.resumeUrl) {
      throw new AppError('Please upload a resume to apply.', 400);
    }
    resumeUrl = profile.resumeUrl;
  }

  let application;
  if (existing && existing.isWithdrawn) {
    // Re-apply
    existing.isWithdrawn = false;
    existing.resumeUrl = resumeUrl;
    existing.coverLetter = coverLetter;
    existing.status = 'applied';
    existing.appliedAt = new Date();
    existing.statusHistory = [{
      status: 'applied',
      changedBy: req.user._id,
      note: 'Application re-submitted',
      changedAt: new Date(),
    }];
    application = await existing.save();
  } else {
    application = await Application.create({
      jobId,
      jobSeekerId: req.user._id,
      resumeUrl,
      coverLetter,
      statusHistory: [{ status: 'applied', changedBy: req.user._id, changedAt: new Date() }],
    });
  }

  // Increment applications count
  Job.findByIdAndUpdate(jobId, { $inc: { applicationsCount: 1 } }).exec();

  // Notify recruiter
  notifyNewApplication(job.recruiterId, req.user.name, job.title, application._id).catch(console.error);

  return formatResponse(res, {
    statusCode: 201,
    message: 'Application submitted successfully!',
    data: { application },
  });
});

// ─── Save / Unsave Job ─────────────────────────────────
const toggleSaveJob = asyncHandler(async (req, res) => {
  const existing = await SavedJob.findOne({
    jobSeekerId: req.user._id,
    jobId: req.params.id,
  });

  if (existing) {
    await SavedJob.deleteOne({ _id: existing._id });
    return formatResponse(res, { message: 'Job removed from saved.', data: { saved: false } });
  }

  const job = await Job.findById(req.params.id);
  if (!job) throw new AppError('Job not found.', 404);

  await SavedJob.create({ jobSeekerId: req.user._id, jobId: req.params.id });
  return formatResponse(res, { statusCode: 201, message: 'Job saved.', data: { saved: true } });
});

// ─── Get Saved Jobs ────────────────────────────────────
const getSavedJobs = asyncHandler(async (req, res) => {
  const saved = await SavedJob.find({ jobSeekerId: req.user._id })
    .populate({
      path: 'jobId',
      populate: { path: 'companyId', select: 'name logoUrl industry location isVerified' },
    })
    .sort({ savedAt: -1 });

  const jobs = saved
    .filter((s) => s.jobId)
    .map((s) => ({
      savedAt: s.savedAt,
      ...s.jobId.toObject(),
    }));

  return formatResponse(res, { data: { jobs } });
});

// ─── Get My Applications ───────────────────────────────
const getMyApplications = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = { jobSeekerId: req.user._id, isWithdrawn: false };
  if (status) query.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [applications, total] = await Promise.all([
    Application.find(query)
      .populate({
        path: 'jobId',
        select: 'title jobType workMode location minSalary maxSalary salaryDisclosed deadline status',
        populate: { path: 'companyId', select: 'name logoUrl' },
      })
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Application.countDocuments(query),
  ]);

  return formatResponse(res, {
    data: { applications },
    meta: { total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) },
  });
});

// ─── Get Single Application ────────────────────────────
const getApplication = asyncHandler(async (req, res) => {
  const application = await Application.findOne({
    _id: req.params.id,
    jobSeekerId: req.user._id,
  })
    .populate({
      path: 'jobId',
      populate: { path: 'companyId', select: 'name logoUrl location' },
    })
    .populate('statusHistory.changedBy', 'name role');

  if (!application) throw new AppError('Application not found.', 404);

  return formatResponse(res, { data: { application } });
});

// ─── Withdraw Application ──────────────────────────────
const withdrawApplication = asyncHandler(async (req, res) => {
  const application = await Application.findOne({
    _id: req.params.id,
    jobSeekerId: req.user._id,
  });

  if (!application) throw new AppError('Application not found.', 404);
  if (application.status !== 'applied') {
    throw new AppError('You can only withdraw applications in "Applied" status.', 400);
  }
  if (application.isWithdrawn) {
    throw new AppError('Application is already withdrawn.', 400);
  }

  application.isWithdrawn = true;
  await application.save();

  return formatResponse(res, { message: 'Application withdrawn.', data: {} });
});

// ─── Job Seeker Dashboard Stats ────────────────────────
const getDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [total, byStatus, profile, recentApplications, savedCount] = await Promise.all([
    Application.countDocuments({ jobSeekerId: userId, isWithdrawn: false }),
    Application.aggregate([
      { $match: { jobSeekerId: userId, isWithdrawn: false } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    JobSeekerProfile.findOne({ userId }).select('skills profileCompletion headline'),
    Application.find({ jobSeekerId: userId, isWithdrawn: false })
      .populate({
        path: 'jobId',
        select: 'title',
        populate: { path: 'companyId', select: 'name logoUrl' },
      })
      .sort({ appliedAt: -1 })
      .limit(5),
    SavedJob.countDocuments({ jobSeekerId: userId }),
  ]);

  const statusMap = {};
  byStatus.forEach(({ _id, count }) => { statusMap[_id] = count; });

  // Recommended jobs
  const skills = profile?.skills?.map((s) => s.name) || [];
  const recommendedJobs = await Job.find({
    status: 'active',
    ...(skills.length > 0 ? { skillsRequired: { $in: skills } } : {}),
  })
    .populate('companyId', 'name logoUrl location')
    .limit(4)
    .sort({ createdAt: -1 });

  return formatResponse(res, {
    data: {
      stats: {
        total,
        applied: statusMap.applied || 0,
        screening: statusMap.screening || 0,
        interview: statusMap.interview || 0,
        offer: statusMap.offer || 0,
        hired: statusMap.hired || 0,
        rejected: statusMap.rejected || 0,
        saved: savedCount,
      },
      profile: {
        completion: profile?.profileCompletion || 0,
        headline: profile?.headline || '',
        skillsCount: skills.length,
      },
      recentApplications,
      recommendedJobs,
    },
  });
});

module.exports = {
  getJobs,
  getJob,
  applyToJob,
  toggleSaveJob,
  getSavedJobs,
  getMyApplications,
  getApplication,
  withdrawApplication,
  getDashboardStats,
};
