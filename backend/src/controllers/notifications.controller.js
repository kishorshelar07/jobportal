const { Notification } = require('../models/index');
const { formatResponse } = require('../utils/formatResponse');
const asyncHandler = require('../utils/asyncHandler');

const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Notification.countDocuments({ userId: req.user._id }),
    Notification.countDocuments({ userId: req.user._id, isRead: false }),
  ]);

  return formatResponse(res, {
    data: { notifications, unreadCount },
    meta: { total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) },
  });
});

const markAsRead = asyncHandler(async (req, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { isRead: true }
  );
  return formatResponse(res, { message: 'Marked as read.', data: {} });
});

const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany(
    { userId: req.user._id, isRead: false },
    { isRead: true }
  );
  return formatResponse(res, {
    message: `${result.modifiedCount} notifications marked as read.`,
    data: { updated: result.modifiedCount },
  });
});

module.exports = { getNotifications, markAsRead, markAllAsRead };
