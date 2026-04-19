const Job = require('../models/Job');
const Application = require('../models/Application');
const Company = require('../models/Company');
const User = require('../models/User');
const JobSeekerProfile = require('../models/JobSeekerProfile');
const { formatResponse } = require('../utils/formatResponse');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { notifyStatusChange } = require('../services/notification.service');
const { sendStatusChangeEmail } = require('../services/email.service');

// ─── Company Profile ───────────────────────────────────
const getCompany = asyncHandler(async (req, res) => {
  const company = await Company.findOne({ recruiterId: req.user._id });
  if (!company) throw new AppError('Company profile not found.', 404);
  return formatResponse(res, { data: { company } });
});

const updateCompany = asyncHandler(async (req, res) => {
  const allowed = ['name', 'website', 'industry', 'size', 'location', 'description'];
  const updates = {};
  allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

  const company = await Company.findOneAndUpdate(
    { recruiterId: req.user._id },
    { $set: updates },
    { new: true, runValidators: true }
  );
  if (!company) throw new AppError('Company not found.', 404);
  return formatResponse(res, { message: 'Company updated.', data: { company } });
});

const uploadCompanyLogo = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('No file uploaded.', 400);
  const logoUrl = `/uploads/logos/${req.user.id}/${req.file.filename}`;
  const company = await Company.findOneAndUpdate(
    { recruiterId: req.user._id },
    { logoUrl },
    { new: true }
  );
  return formatResponse(res, { message: 'Logo uploaded.', data: { logoUrl: company.logoUrl } });
});

// ─── Jobs CRUD ─────────────────────────────────────────
const getMyJobs = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = { recruiterId: req.user._id };
  if (status) query.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [jobs, total] = await Promise.all([
    Job.find(query)
      .populate('companyId', 'name logoUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Job.countDocuments(query),
  ]);

  return formatResponse(res, {
    data: { jobs },
    meta: { total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) },
  });
});

const createJob = asyncHandler(async (req, res) => {
  const company = await Company.findOne({ recruiterId: req.user._id });
  if (!company) throw new AppError('Company profile required before posting jobs.', 400);

  const jobData = { ...req.body, recruiterId: req.user._id, companyId: company._id };
  const job = await Job.create(jobData);

  return formatResponse(res, {
    statusCode: 201,
    message: `Job ${job.status === 'active' ? 'published' : 'saved as draft'} successfully!`,
    data: { job },
  });
});

const getJobById = asyncHandler(async (req, res) => {
  const job = await Job.findOne({ _id: req.params.id, recruiterId: req.user._id })
    .populate('companyId', 'name logoUrl');
  if (!job) throw new AppError('Job not found.', 404);
  return formatResponse(res, { data: { job } });
});

const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findOneAndUpdate(
    { _id: req.params.id, recruiterId: req.user._id },
    { $set: req.body },
    { new: true, runValidators: true }
  );
  if (!job) throw new AppError('Job not found.', 404);
  return formatResponse(res, { message: 'Job updated.', data: { job } });
});

const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findOne({ _id: req.params.id, recruiterId: req.user._id });
  if (!job) throw new AppError('Job not found.', 404);
  if (job.applicationsCount > 0) {
    throw new AppError('Cannot delete a job that has applications. Close it instead.', 400);
  }
  await job.deleteOne();
  return formatResponse(res, { message: 'Job deleted.', data: {} });
});

const duplicateJob = asyncHandler(async (req, res) => {
  const original = await Job.findOne({ _id: req.params.id, recruiterId: req.user._id });
  if (!original) throw new AppError('Job not found.', 404);

  const { _id, viewsCount, applicationsCount, createdAt, updatedAt, ...jobData } = original.toObject();
  const newJob = await Job.create({
    ...jobData,
    title: `${original.title} (Copy)`,
    status: 'draft',
    viewsCount: 0,
    applicationsCount: 0,
  });

  return formatResponse(res, { statusCode: 201, message: 'Job duplicated as draft.', data: { job: newJob } });
});

// ─── Applicants ────────────────────────────────────────
const getApplicants = asyncHandler(async (req, res) => {
  const { status, skillsFilter, expMin, expMax, page = 1, limit = 20 } = req.query;

  // Verify job belongs to recruiter
  const job = await Job.findOne({ _id: req.params.jobId, recruiterId: req.user._id });
  if (!job) throw new AppError('Job not found.', 404);

  const query = { jobId: req.params.jobId, isWithdrawn: false };
  if (status) query.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  let applications = await Application.find(query)
    .populate('jobSeekerId', 'name email profilePicture')
    .sort({ appliedAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Application.countDocuments(query);

  // Enrich with profile data
  const enriched = await Promise.all(
    applications.map(async (app) => {
      const profile = await JobSeekerProfile.findOne({ userId: app.jobSeekerId._id })
        .select('headline skills experienceYears location resumeUrl');

      const requiredSkills = job.skillsRequired.map((s) => s.toLowerCase());
      const seekerSkills = (profile?.skills || []).map((s) => s.name.toLowerCase());
      const matchCount = seekerSkills.filter((s) => requiredSkills.includes(s)).length;
      const skillMatch = requiredSkills.length > 0
        ? Math.round((matchCount / requiredSkills.length) * 100) : 0;

      return {
        ...app.toObject(),
        profile: profile || {},
        skillMatch,
      };
    })
  );

  // Filter by experience if specified
  let filtered = enriched;
  if (expMin || expMax) {
    filtered = enriched.filter((a) => {
      const exp = a.profile?.experienceYears || 0;
      if (expMin && exp < parseInt(expMin)) return false;
      if (expMax && exp > parseInt(expMax)) return false;
      return true;
    });
  }

  return formatResponse(res, {
    data: { applicants: filtered, job },
    meta: { total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) },
  });
});

const getApplicantDetail = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.appId)
    .populate('jobSeekerId', 'name email profilePicture')
    .populate('statusHistory.changedBy', 'name role');

  if (!application) throw new AppError('Application not found.', 404);

  // Verify recruiter owns this job
  const job = await Job.findOne({ _id: application.jobId, recruiterId: req.user._id });
  if (!job) throw new AppError('Access denied.', 403);

  const profile = await JobSeekerProfile.findOne({ userId: application.jobSeekerId._id });

  // Mark as viewed
  if (!application.viewedByRecruiter) {
    Application.findByIdAndUpdate(application._id, { viewedByRecruiter: true }).exec();
  }

  return formatResponse(res, { data: { application, profile, job } });
});

const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const validStatuses = ['screening', 'interview', 'offer', 'rejected', 'hired'];

  if (!validStatuses.includes(status)) {
    throw new AppError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
  }

  const application = await Application.findById(req.params.appId)
    .populate('jobSeekerId', 'name email');

  if (!application) throw new AppError('Application not found.', 404);

  // Verify recruiter owns this job
  const job = await Job.findOne({ _id: application.jobId, recruiterId: req.user._id })
    .populate('companyId', 'name');
  if (!job) throw new AppError('Access denied.', 403);

  application.status = status;
  application.statusHistory.push({
    status,
    changedBy: req.user._id,
    note: note || '',
    changedAt: new Date(),
  });
  await application.save();

  // Notify seeker
  const seeker = application.jobSeekerId;
  notifyStatusChange(seeker._id, job.title, job.companyId.name, status, application._id).catch(console.error);
  sendStatusChangeEmail(seeker, job.title, job.companyId.name, status, note).catch(console.error);

  return formatResponse(res, {
    message: `Application status updated to "${status}".`,
    data: { application },
  });
});

const bulkUpdateStatus = asyncHandler(async (req, res) => {
  const { applicationIds, status, note } = req.body;

  if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
    throw new AppError('applicationIds array is required.', 400);
  }

  const validStatuses = ['screening', 'interview', 'offer', 'rejected', 'hired'];
  if (!validStatuses.includes(status)) {
    throw new AppError('Invalid status.', 400);
  }

  // Verify these applications belong to recruiter's jobs
  const jobs = await Job.find({ recruiterId: req.user._id }).select('_id');
  const jobIds = jobs.map((j) => j._id.toString());

  const applications = await Application.find({
    _id: { $in: applicationIds },
    jobId: { $in: jobIds },
  }).populate('jobSeekerId', 'name email');

  if (applications.length === 0) {
    throw new AppError('No valid applications found.', 404);
  }

  const historyEntry = { status, changedBy: req.user._id, note: note || '', changedAt: new Date() };

  await Application.updateMany(
    { _id: { $in: applications.map((a) => a._id) } },
    {
      $set: { status },
      $push: { statusHistory: historyEntry },
    }
  );

  return formatResponse(res, {
    message: `${applications.length} applications updated to "${status}".`,
    data: { updated: applications.length },
  });
});

// ─── Recruiter Dashboard ───────────────────────────────
const getDashboardStats = asyncHandler(async (req, res) => {
  const recruiterId = req.user._id;

  const jobs = await Job.find({ recruiterId }).select('_id applicationsCount status title viewsCount');
  const jobIds = jobs.map((j) => j._id);

  const [totalApplications, byStatus, hiredCount, weeklyApplications] = await Promise.all([
    Application.countDocuments({ jobId: { $in: jobIds }, isWithdrawn: false }),
    Application.aggregate([
      { $match: { jobId: { $in: jobIds }, isWithdrawn: false } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Application.countDocuments({ jobId: { $in: jobIds }, status: 'hired' }),
    Application.aggregate([
      {
        $match: {
          jobId: { $in: jobIds },
          appliedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dayOfWeek: '$appliedAt' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id': 1 } },
    ]),
  ]);

  const statusMap = {};
  byStatus.forEach(({ _id, count }) => { statusMap[_id] = count; });

  const activeJobs = jobs.filter((j) => j.status === 'active').length;
  const closedJobs = jobs.filter((j) => j.status === 'closed').length;
  const draftJobs = jobs.filter((j) => j.status === 'draft').length;

  // Top jobs by applications
  const topJobs = jobs
    .sort((a, b) => b.applicationsCount - a.applicationsCount)
    .slice(0, 5)
    .map((j) => ({ id: j._id, title: j.title, count: j.applicationsCount, views: j.viewsCount }));

  // Recent applicants
  const recentApplicants = await Application.find({ jobId: { $in: jobIds }, isWithdrawn: false })
    .populate('jobSeekerId', 'name email profilePicture')
    .populate('jobId', 'title')
    .sort({ appliedAt: -1 })
    .limit(5);

  return formatResponse(res, {
    data: {
      stats: {
        totalJobs: jobs.length,
        activeJobs,
        closedJobs,
        draftJobs,
        totalApplications,
        hiredCount,
        statusBreakdown: statusMap,
      },
      topJobs,
      recentApplicants,
      weeklyApplications,
    },
  });
});

module.exports = {
  getCompany,
  updateCompany,
  uploadCompanyLogo,
  getMyJobs,
  createJob,
  getJobById,
  updateJob,
  deleteJob,
  duplicateJob,
  getApplicants,
  getApplicantDetail,
  updateApplicationStatus,
  bulkUpdateStatus,
  getDashboardStats,
};
