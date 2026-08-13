const asyncHandler = require('express-async-handler');
const { getRecentNotifications } = require('../services/notificationService');

// @desc    Get recent (simulated) notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 20;
  res.json({ success: true, data: getRecentNotifications(limit) });
});

module.exports = { getNotifications };
