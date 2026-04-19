const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const { restrictTo } = require('../../middleware/role');
const { uploadApplyResume } = require('../../config/multer');
const ctrl = require('../../controllers/jobs.controller');

// Public routes (with optional auth for personalization)
router.get('/', (req, res, next) => {
  // Optional auth — attach user if token present
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const { protect } = require('../../middleware/auth');
    return protect(req, res, () => next());
  }
  next();
}, ctrl.getJobs);

router.get('/saved', protect, restrictTo('jobseeker'), ctrl.getSavedJobs);
router.get('/my-applications', protect, restrictTo('jobseeker'), ctrl.getMyApplications);
router.get('/my-applications/:id', protect, restrictTo('jobseeker'), ctrl.getApplication);
router.get('/dashboard', protect, restrictTo('jobseeker'), ctrl.getDashboardStats);

router.get('/:id', (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const { protect } = require('../../middleware/auth');
    return protect(req, res, () => next());
  }
  next();
}, ctrl.getJob);

router.post('/:id/apply', protect, restrictTo('jobseeker'), uploadApplyResume.single('resume'), ctrl.applyToJob);
router.post('/:id/save', protect, restrictTo('jobseeker'), ctrl.toggleSaveJob);
router.delete('/applications/:id/withdraw', protect, restrictTo('jobseeker'), ctrl.withdrawApplication);

module.exports = router;
