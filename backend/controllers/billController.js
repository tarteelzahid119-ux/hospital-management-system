const asyncHandler = require('express-async-handler');
const Bill = require('../models/Bill');
const Patient = require('../models/Patient');

// @desc    Generate a new bill for a patient
// @route   POST /api/bills
// @access  Private/Admin,Receptionist
const createBill = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.body.patient);
  if (!patient) {
    res.status(404);
    throw new Error('Patient not found');
  }

  const bill = await Bill.create({ ...req.body, generatedBy: req.user._id });
  res.status(201).json({ success: true, data: bill });
});

// @desc    Get all bills (filters: ?patient=&paymentStatus=)
// @route   GET /api/bills
// @access  Private
const getBills = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.patient) filter.patient = req.query.patient;
  if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;

  const bills = await Bill.find(filter)
    .populate('patient', 'name phone')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: bills.length, data: bills });
});

// @desc    Get single bill
// @route   GET /api/bills/:id
// @access  Private
const getBillById = asyncHandler(async (req, res) => {
  const bill = await Bill.findById(req.params.id).populate('patient', 'name phone');
  if (!bill) {
    res.status(404);
    throw new Error('Bill not found');
  }
  res.json({ success: true, data: bill });
});

// @desc    Update payment status of a bill
// @route   PATCH /api/bills/:id/payment
// @access  Private/Admin,Receptionist
const updatePaymentStatus = asyncHandler(async (req, res) => {
  const bill = await Bill.findByIdAndUpdate(
    req.params.id,
    { paymentStatus: req.body.paymentStatus },
    { new: true, runValidators: true }
  );
  if (!bill) {
    res.status(404);
    throw new Error('Bill not found');
  }
  res.json({ success: true, data: bill });
});

// @desc    Delete a bill
// @route   DELETE /api/bills/:id
// @access  Private/Admin
const deleteBill = asyncHandler(async (req, res) => {
  const bill = await Bill.findByIdAndDelete(req.params.id);
  if (!bill) {
    res.status(404);
    throw new Error('Bill not found');
  }
  res.json({ success: true, message: 'Bill removed', data: { id: req.params.id } });
});

module.exports = { createBill, getBills, getBillById, updatePaymentStatus, deleteBill };
