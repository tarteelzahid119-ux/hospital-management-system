const express = require('express');
const router = express.Router();
const { getNotifications } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Simulated appointment alerts
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get recent notifications
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/', protect, getNotifications);

module.exports = router;
