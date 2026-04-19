const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Company = require('../models/Company');
const { Notification } = require('../models/index');
const { formatResponse } = require('../utils/formatResponse');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// ─── Dashboard Stats ───────────────────────────────────
const getDashboardStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalUsers,
    totalJobs,
    totalApplications,
    totalCompanies,
    newSignupsThisMonth,
    jobsByStatus,
    usersByRole,
    monthlySignups,
  ] = await Promise.all([
    User.countDocuments({ role: { $ne: 'admin' } }),
    Job.countDocuments(),
    Application.countDocuments(),
    Company.countDocuments(),
    User.countDocuments({ createdAt: { $gte: startOfMonth }, role: { $ne: 'admin' } }),
    Job.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    User.aggregate([
      { $match: { role: { $ne: 'admin' } } },
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]),
    User.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) },
          role: { $ne: 'admin' },
        },
      },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
  ]);

  return formatResponse(res, {
    data: {
      stats: {
        totalUsers,
        totalJobs,
        totalApplications,
        totalCompanies,
        newSignupsThisMonth,
      },
      jobsByStatus: Object.fromEntries(jobsByStatus.map(({ _id, count }) => [_id, count])),
      usersByRole: Object.fromEntries(usersByRole.map(({ _id, count }) => [_id, count])),
      monthlySignups,
    },
  });
});

// ─── Users Management ──────────────────────────────────
const getUsers = asyncHandler(async (req, res) => {
  const { search, role, isActive, page = 1, limit = 20 } = req.query;
  const query = { role: { $ne: 'admin' } };
  if (search) query.$or = [
    { name: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
  ];
  if (role) query.role = role;
  if (isActive !== undefined) query.isActive = isActive === 'true';

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    User.countDocuments(query),
  ]);

  return formatResponse(res, {
    data: { users },
    meta: { total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) },
  });
});

const toggleUserActive = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found.', 404);
  if (user.role === 'admin') throw new AppError('Cannot deactivate admin account.', 403);

  user.isActive = !user.isActive;
  await user.save();

  return formatResponse(res, {
    message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully.`,
    data: { user: user.toSafeObject() },
  });
});

// ─── Companies Management ──────────────────────────────
const getCompanies = asyncHandler(async (req, res) => {
  const { search, isVerified, page = 1, limit = 20 } = req.query;
  const query = {};
  if (search) query.name = { $regex: search, $options: 'i' };
  if (isVerified !== undefined) query.isVerified = isVerified === 'true';

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [companies, total] = await Promise.all([
    Company.find(query)
      .populate('recruiterId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Company.countDocuments(query),
  ]);

  return formatResponse(res, {
    data: { companies },
    meta: { total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) },
  });
});

const verifyCompany = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);
  if (!company) throw new AppError('Company not found.', 404);

  company.isVerified = !company.isVerified;
  await company.save();

  return formatResponse(res, {
    message: `Company ${company.isVerified ? 'verified' : 'unverified'}.`,
    data: { company },
  });
});

// ─── Jobs Management ───────────────────────────────────
const getAllJobs = asyncHandler(async (req, res) => {
  const { search, status, page = 1, limit = 20 } = req.query;
  const query = {};
  if (search) query.$text = { $search: search };
  if (status) query.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [jobs, total] = await Promise.all([
    Job.find(query)
      .populate('companyId', 'name')
      .populate('recruiterId', 'name email')
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

const closeJob = asyncHandler(async (req, res) => {
  const job = await Job.findByIdAndUpdate(
    req.params.id,
    { status: 'closed' },
    { new: true }
  );
  if (!job) throw new AppError('Job not found.', 404);
  return formatResponse(res, { message: 'Job closed by admin.', data: { job } });
});

module.exports = {
  getDashboardStats,
  getUsers,
  toggleUserActive,
  getCompanies,
  verifyCompany,
  getAllJobs,
  closeJob,
};
