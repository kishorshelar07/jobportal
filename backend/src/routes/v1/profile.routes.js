const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const { restrictTo } = require('../../middleware/role');
const { uploadProfilePic, uploadResume } = require('../../config/multer');
const ctrl = require('../../controllers/profile.controller');

router.use(protect);
router.use(restrictTo('jobseeker'));

router.get('/', ctrl.getProfile);
router.get('/public/:userId', ctrl.getProfileById);
router.put('/', ctrl.updateProfile);
router.put('/name', ctrl.updateUserName);
router.post('/picture', uploadProfilePic.single('profilePicture'), ctrl.uploadProfilePicture);
router.post('/resume', uploadResume.single('resume'), ctrl.uploadResume);

// Experience
router.post('/experience', ctrl.addExperience);
router.put('/experience/:expId', ctrl.updateExperience);
router.delete('/experience/:expId', ctrl.deleteExperience);

// Education
router.post('/education', ctrl.addEducation);
router.put('/education/:eduId', ctrl.updateEducation);
router.delete('/education/:eduId', ctrl.deleteEducation);

// Skills
router.put('/skills', ctrl.updateSkills);

module.exports = router;
