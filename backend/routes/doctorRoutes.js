const express = require('express');
const router = express.Router();

const {
  createDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
} = require('../controllers/doctorController');

const {
  createDoctorValidator,
  updateDoctorValidator,
} = require('../validators/doctorValidator');

const validate = require('../middleware/validateMiddleware');
const { protect, authorize } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Doctors
 *   description: Doctor management
 */

router.use(protect);

/**
 * @swagger
 * /api/doctors:
 *   get:
 *     summary: List all doctors
 *     tags: [Doctors]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: specialization
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of doctors
 *
 *   post:
 *     summary: Create a doctor (Admin only)
 *     tags: [Doctors]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201:
 *         description: Doctor created
 */
router
  .route('/')
  .get(getDoctors)
  .post(
    authorize('admin'),
    createDoctorValidator,
    validate,
    createDoctor
  );

/**
 * @swagger
 * /api/doctors/{id}:
 *   get:
 *     summary: Get a doctor by ID
 *     tags: [Doctors]
 *     security: [{ bearerAuth: [] }]
 *
 *   put:
 *     summary: Update a doctor (Admin only)
 *     tags: [Doctors]
 *     security: [{ bearerAuth: [] }]
 *
 *   delete:
 *     summary: Delete a doctor (Admin only)
 *     tags: [Doctors]
 *     security: [{ bearerAuth: [] }]
 */
router
  .route('/:id')
  .get(getDoctorById)
  .put(
    authorize('admin'),
    updateDoctorValidator,
    validate,
    updateDoctor
  )
  .delete(
    authorize('admin'),
    deleteDoctor
  );

module.exports = router;