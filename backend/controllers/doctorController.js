const asyncHandler = require('express-async-handler');
const Doctor = require('../models/Doctor');

// @desc    Create a doctor
// @route   POST /api/doctors
// @access  Private/Admin
const createDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.create(req.body);
  res.status(201).json({ success: true, data: doctor });
});

// @desc    Get all doctors (supports ?specialization=&isActive=)
// @route   GET /api/doctors
// @access  Private
const getDoctors = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.specialization) filter.specialization = new RegExp(req.query.specialization, 'i');
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

  const doctors = await Doctor.find(filter).sort({ name: 1 });
  res.json({ success: true, count: doctors.length, data: doctors });
});

// @desc    Get single doctor
// @route   GET /api/doctors/:id
// @access  Private
const getDoctorById = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) {
    res.status(404);
    throw new Error('Doctor not found');
  }
  res.json({ success: true, data: doctor });
});

// @desc    Update doctor
// @route   PUT /api/doctors/:id
// @access  Private/Admin
const updateDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!doctor) {
    res.status(404);
    throw new Error('Doctor not found');
  }
  res.json({ success: true, data: doctor });
});

// @desc    Delete doctor
// @route   DELETE /api/doctors/:id
// @access  Private/Admin
const deleteDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findByIdAndDelete(req.params.id);
  if (!doctor) {
    res.status(404);
    throw new Error('Doctor not found');
  }
  res.json({ success: true, message: 'Doctor removed', data: { id: req.params.id } });
});

module.exports = { createDoctor, getDoctors, getDoctorById, updateDoctor, deleteDoctor };
