const { Notification } = require('../models/index');

const createNotification = async ({ userId, type, title, message, referenceId, referenceType }) => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      referenceId,
      referenceType,
    });
    return notification;
  } catch (error) {
    console.error('Notification creation failed:', error.message);
    return null;
  }
};

const notifyStatusChange = async (jobSeekerId, jobTitle, company, newStatus, applicationId) => {
  const statusMessages = {
    screening: `Your application for ${jobTitle} at ${company} is now under screening.`,
    interview: `🎉 Congratulations! You've been shortlisted for an interview for ${jobTitle} at ${company}.`,
    offer: `🌟 Amazing news! You have received an offer for ${jobTitle} at ${company}!`,
    rejected: `We regret to inform you that your application for ${jobTitle} at ${company} was not selected.`,
    hired: `🎊 Congratulations! You've been hired for ${jobTitle} at ${company}!`,
  };

  return createNotification({
    userId: jobSeekerId,
    type: 'status_change',
    title: `Application Update: ${jobTitle}`,
    message: statusMessages[newStatus] || `Your application status changed to ${newStatus}.`,
    referenceId: applicationId,
    referenceType: 'Application',
  });
};

const notifyApplicationViewed = async (jobSeekerId, jobTitle, applicationId) => {
  return createNotification({
    userId: jobSeekerId,
    type: 'application_viewed',
    title: 'Application Viewed',
    message: `A recruiter viewed your application for ${jobTitle}.`,
    referenceId: applicationId,
    referenceType: 'Application',
  });
};

const notifyNewApplication = async (recruiterId, seekerName, jobTitle, applicationId) => {
  return createNotification({
    userId: recruiterId,
    type: 'application_received',
    title: `New Application for ${jobTitle}`,
    message: `${seekerName} applied for your job posting: ${jobTitle}.`,
    referenceId: applicationId,
    referenceType: 'Application',
  });
};

module.exports = {
  createNotification,
  notifyStatusChange,
  notifyApplicationViewed,
  notifyNewApplication,
};
