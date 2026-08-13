const express = require('express');
const router = express.Router();
const {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
} = require('../controllers/patientController');
const { patientValidator } = require('../validators/patientValidator');
const validate = require('../middleware/validateMiddleware');
const { protect, authorize } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Patients
 *   description: Patient registration & records
 */

router.use(protect);

/**
 * @swagger
 * /api/patients:
 *   get:
 *     summary: List all patients
 *     tags: [Patients]
 *     security: [{ bearerAuth: [] }]
 *   post:
 *     summary: Register a new patient (Admin/Receptionist)
 *     tags: [Patients]
 *     security: [{ bearerAuth: [] }]
 */
router.route('/')
  .get(getPatients)
  .post(authorize('admin', 'receptionist'), patientValidator, validate, createPatient);

/**
 * @swagger
 * /api/patients/{id}:
 *   get:
 *     summary: Get a patient by ID
 *     tags: [Patients]
 *     security: [{ bearerAuth: [] }]
 *   put:
 *     summary: Update a patient (Admin/Receptionist)
 *     tags: [Patients]
 *     security: [{ bearerAuth: [] }]
 *   delete:
 *     summary: Delete a patient (Admin only)
 *     tags: [Patients]
 *     security: [{ bearerAuth: [] }]
 */
router.route('/:id')
  .get(getPatientById)
  .put(authorize('admin', 'receptionist'), patientValidator, validate, updatePatient)
  .delete(authorize('admin'), deletePatient);

module.exports = router;
