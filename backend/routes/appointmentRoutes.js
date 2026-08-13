const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  updateAppointment,
  deleteAppointment,
} = require('../controllers/appointmentController');
const { appointmentValidator, statusValidator } = require('../validators/appointmentValidator');
const validate = require('../middleware/validateMiddleware');
const { protect, authorize } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Appointments
 *   description: Appointment scheduling
 */

router.use(protect);

/**
 * @swagger
 * /api/appointments:
 *   get:
 *     summary: List appointments (filters by doctor/patient/status/date)
 *     tags: [Appointments]
 *     security: [{ bearerAuth: [] }]
 *   post:
 *     summary: Book an appointment (prevents double-booking)
 *     tags: [Appointments]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       409: { description: Time slot conflict with an existing appointment }
 */
router.route('/')
  .get(getAppointments)
  .post(authorize('admin', 'receptionist'), appointmentValidator, validate, createAppointment);

/**
 * @swagger
 * /api/appointments/{id}:
 *   get:
 *     summary: Get an appointment by ID
 *     tags: [Appointments]
 *     security: [{ bearerAuth: [] }]
 *   put:
 *     summary: Reschedule/update an appointment
 *     tags: [Appointments]
 *     security: [{ bearerAuth: [] }]
 *   delete:
 *     summary: Cancel/delete an appointment
 *     tags: [Appointments]
 *     security: [{ bearerAuth: [] }]
 */
router.route('/:id')
  .get(getAppointmentById)
  .put(authorize('admin', 'receptionist'), updateAppointment)
  .delete(authorize('admin', 'receptionist'), deleteAppointment);

/**
 * @swagger
 * /api/appointments/{id}/status:
 *   patch:
 *     summary: Update appointment status (pending/confirmed/completed/cancelled)
 *     tags: [Appointments]
 *     security: [{ bearerAuth: [] }]
 */
router.patch(
  '/:id/status',
  authorize('admin', 'receptionist', 'doctor'),
  statusValidator,
  validate,
  updateAppointmentStatus
);

module.exports = router;
