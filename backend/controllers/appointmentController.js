const asyncHandler = require('express-async-handler');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const { sendAppointmentNotification } = require('../services/notificationService');

// Helper: check whether two time ranges [aStart,aEnd) and [bStart,bEnd) overlap
const timesOverlap = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && bStart < aEnd;

// @desc    Book an appointment (prevents double-booking for the same doctor)
// @route   POST /api/appointments
// @access  Private/Admin,Receptionist
const createAppointment = asyncHandler(async (req, res) => {
  const { patient, doctor, date, startTime, endTime, reason } = req.body;

  const [doctorDoc, patientDoc] = await Promise.all([
    Doctor.findById(doctor),
    Patient.findById(patient),
  ]);
  if (!doctorDoc) {
    res.status(404);
    throw new Error('Doctor not found');
  }
  if (!patientDoc) {
    res.status(404);
    throw new Error('Patient not found');
  }

  if (startTime >= endTime) {
    res.status(400);
    throw new Error('startTime must be before endTime');
  }

  // Double-booking check: any existing pending/confirmed appointment for this
  // doctor on the same date whose time range overlaps the requested range.
  const sameDay = new Date(date);
  const dayStart = new Date(sameDay.setHours(0, 0, 0, 0));
  const dayEnd = new Date(sameDay.setHours(23, 59, 59, 999));

  const existingAppointments = await Appointment.find({
    doctor,
    date: { $gte: dayStart, $lte: dayEnd },
    status: { $in: ['pending', 'confirmed'] },
  });

  const conflict = existingAppointments.some((appt) =>
    timesOverlap(startTime, endTime, appt.startTime, appt.endTime)
  );

  if (conflict) {
    res.status(409);
    throw new Error('This doctor already has an appointment that overlaps with the requested time slot');
  }

  const appointment = await Appointment.create({
    patient,
    doctor,
    date,
    startTime,
    endTime,
    reason,
    createdBy: req.user._id,
  });

  sendAppointmentNotification({
    type: 'CREATED',
    appointment,
    patientName: patientDoc.name,
    doctorName: doctorDoc.name,
  });

  res.status(201).json({ success: true, data: appointment });
});

// @desc    Get all appointments (filters: ?doctor=&patient=&status=&date=)
// @route   GET /api/appointments
// @access  Private
const getAppointments = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.doctor) filter.doctor = req.query.doctor;
  if (req.query.patient) filter.patient = req.query.patient;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.date) {
    const d = new Date(req.query.date);
    filter.date = { $gte: new Date(d.setHours(0, 0, 0, 0)), $lte: new Date(d.setHours(23, 59, 59, 999)) };
  }

  // Doctors can only see their own appointments
  if (req.user.role === 'doctor' && req.user.doctorProfile) {
    filter.doctor = req.user.doctorProfile;
  }

  const appointments = await Appointment.find(filter)
    .populate('patient', 'name age gender phone')
    .populate('doctor', 'name specialization')
    .sort({ date: 1, startTime: 1 });

  res.json({ success: true, count: appointments.length, data: appointments });
});

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
const getAppointmentById = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate('patient', 'name age gender phone')
    .populate('doctor', 'name specialization');
  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }
  res.json({ success: true, data: appointment });
});

// @desc    Update appointment status (pending/confirmed/completed/cancelled)
// @route   PATCH /api/appointments/:id/status
// @access  Private/Admin,Receptionist,Doctor
const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const appointment = await Appointment.findById(req.params.id)
    .populate('patient', 'name')
    .populate('doctor', 'name');
  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  appointment.status = status;
  await appointment.save();

  sendAppointmentNotification({
    type: status.toUpperCase(),
    appointment,
    patientName: appointment.patient.name,
    doctorName: appointment.doctor.name,
  });

  res.json({ success: true, data: appointment });
});

// @desc    Reschedule/update appointment details
// @route   PUT /api/appointments/:id
// @access  Private/Admin,Receptionist
const updateAppointment = asyncHandler(async (req, res) => {
  const { date, startTime, endTime } = req.body;
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }

  if (date || startTime || endTime) {
    const newDate = date ? new Date(date) : appointment.date;
    const newStart = startTime || appointment.startTime;
    const newEnd = endTime || appointment.endTime;

    const dayStart = new Date(new Date(newDate).setHours(0, 0, 0, 0));
    const dayEnd = new Date(new Date(newDate).setHours(23, 59, 59, 999));

    const existing = await Appointment.find({
      _id: { $ne: appointment._id },
      doctor: appointment.doctor,
      date: { $gte: dayStart, $lte: dayEnd },
      status: { $in: ['pending', 'confirmed'] },
    });

    const conflict = existing.some((appt) => timesOverlap(newStart, newEnd, appt.startTime, appt.endTime));
    if (conflict) {
      res.status(409);
      throw new Error('Doctor already has an overlapping appointment at the new time slot');
    }
  }

  Object.assign(appointment, req.body);
  await appointment.save();

  res.json({ success: true, data: appointment });
});

// @desc    Cancel/delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private/Admin,Receptionist
const deleteAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findByIdAndDelete(req.params.id);
  if (!appointment) {
    res.status(404);
    throw new Error('Appointment not found');
  }
  res.json({ success: true, message: 'Appointment removed', data: { id: req.params.id } });
});

module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  updateAppointment,
  deleteAppointment,
};
