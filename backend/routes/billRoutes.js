const express = require('express');
const router = express.Router();
const {
  createBill,
  getBills,
  getBillById,
  updatePaymentStatus,
  deleteBill,
} = require('../controllers/billController');
const { billValidator, paymentStatusValidator } = require('../validators/billValidator');
const validate = require('../middleware/validateMiddleware');
const { protect, authorize } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Billing
 *   description: Billing & payments
 */

router.use(protect);

/**
 * @swagger
 * /api/bills:
 *   get:
 *     summary: List bills (filters by patient/paymentStatus)
 *     tags: [Billing]
 *     security: [{ bearerAuth: [] }]
 *   post:
 *     summary: Generate a bill (Admin/Receptionist)
 *     tags: [Billing]
 *     security: [{ bearerAuth: [] }]
 */
router.route('/')
  .get(getBills)
  .post(authorize('admin', 'receptionist'), billValidator, validate, createBill);

/**
 * @swagger
 * /api/bills/{id}:
 *   get:
 *     summary: Get a bill by ID
 *     tags: [Billing]
 *     security: [{ bearerAuth: [] }]
 *   delete:
 *     summary: Delete a bill (Admin only)
 *     tags: [Billing]
 *     security: [{ bearerAuth: [] }]
 */
router.route('/:id')
  .get(getBillById)
  .delete(authorize('admin'), deleteBill);

/**
 * @swagger
 * /api/bills/{id}/payment:
 *   patch:
 *     summary: Update payment status of a bill
 *     tags: [Billing]
 *     security: [{ bearerAuth: [] }]
 */
router.patch(
  '/:id/payment',
  authorize('admin', 'receptionist'),
  paymentStatusValidator,
  validate,
  updatePaymentStatus
);

module.exports = router;
