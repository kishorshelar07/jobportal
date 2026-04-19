const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const { restrictTo } = require('../../middleware/role');
const { uploadLogo } = require('../../config/multer');
const ctrl = require('../../controllers/recruiter.controller');

router.use(protect);
router.use(restrictTo('recruiter'));

// Company
router.get('/company', ctrl.getCompany);
router.put('/company', ctrl.updateCompany);
router.post('/company/logo', uploadLogo.single('logo'), ctrl.uploadCompanyLogo);

// Jobs
router.get('/jobs', ctrl.getMyJobs);
router.post('/jobs', ctrl.createJob);
router.get('/jobs/:id', ctrl.getJobById);
router.put('/jobs/:id', ctrl.updateJob);
router.delete('/jobs/:id', ctrl.deleteJob);
router.post('/jobs/:id/duplicate', ctrl.duplicateJob);

// Applicants
router.get('/jobs/:jobId/applicants', ctrl.getApplicants);
router.get('/applications/:appId', ctrl.getApplicantDetail);
router.put('/applications/:appId/status', ctrl.updateApplicationStatus);
router.put('/applications/bulk-status', ctrl.bulkUpdateStatus);

// Dashboard
router.get('/dashboard', ctrl.getDashboardStats);

module.exports = router;
