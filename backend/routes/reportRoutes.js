const express = require('express');
const router = express.Router();
const { getSummaryReport } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Daily/weekly analytics
 */

/**
 * @swagger
 * /api/reports/summary:
 *   get:
 *     summary: Get summary report (patients, appointments, revenue)
 *     tags: [Reports]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: period
 *         schema: { type: string, enum: [daily, weekly] }
 *     responses:
 *       200: { description: Summary report data }
 */
router.get('/summary', protect, authorize('admin', 'doctor', 'receptionist'), getSummaryReport);

module.exports = router;
