const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const { restrictTo } = require('../../middleware/role');
const ctrl = require('../../controllers/admin.controller');

router.use(protect);
router.use(restrictTo('admin'));

router.get('/dashboard', ctrl.getDashboardStats);
router.get('/users', ctrl.getUsers);
router.put('/users/:id/toggle-active', ctrl.toggleUserActive);
router.get('/companies', ctrl.getCompanies);
router.put('/companies/:id/verify', ctrl.verifyCompany);
router.get('/jobs', ctrl.getAllJobs);
router.put('/jobs/:id/close', ctrl.closeJob);

module.exports = router;
