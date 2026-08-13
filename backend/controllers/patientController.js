const asyncHandler = require('express-async-handler');
const Patient = require('../models/Patient');

// @desc    Register a new patient
// @route   POST /api/patients
// @access  Private/Admin,Receptionist
const createPatient = asyncHandler(async (req, res) => {
  const patient = await Patient.create({ ...req.body, registeredBy: req.user._id });
  res.status(201).json({ success: true, data: patient });
});

// @desc    Get all patients (supports ?search=)
// @route   GET /api/patients
// @access  Private
const getPatients = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.search) {
    filter.$or = [
      { name: new RegExp(req.query.search, 'i') },
      { phone: new RegExp(req.query.search, 'i') },
    ];
  }
  const patients = await Patient.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, count: patients.length, data: patients });
});

// @desc    Get single patient
// @route   GET /api/patients/:id
// @access  Private
const getPatientById = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }
  res.json({ success: true, data: patient });
});

// @desc    Update patient
// @route   PUT /api/patients/:id
// @access  Private/Admin,Receptionist
const updatePatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }
  res.json({ success: true, data: patient });
});

// @desc    Delete patient
// @route   DELETE /api/patients/:id
// @access  Private/Admin
const deletePatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findByIdAndDelete(req.params.id);
  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }
  res.json({ success: true, message: 'Patient removed', data: { id: req.params.id } });
});

module.exports = { createPatient, getPatients, getPatientById, updatePatient, deletePatient };
