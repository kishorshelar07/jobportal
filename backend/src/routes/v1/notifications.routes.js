const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const ctrl = require('../../controllers/notifications.controller');

router.use(protect);
router.get('/', ctrl.getNotifications);
router.put('/read-all', ctrl.markAllAsRead);
router.put('/:id/read', ctrl.markAsRead);

module.exports = router;
