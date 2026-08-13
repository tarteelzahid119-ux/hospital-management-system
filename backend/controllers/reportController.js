const asyncHandler = require('express-async-handler');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Bill = require('../models/Bill');

// Resolves a `period` query param ('daily' | 'weekly') into a start date
const getStartDateForPeriod = (period) => {
  const now = new Date();
  if (period === 'weekly') {
    const start = new Date(now);
    start.setDate(start.getDate() - 7);
    start.setHours(0, 0, 0, 0);
    return start;
  }
  // default: daily
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  return start;
};

// @desc    Get summary report: total patients, appointments, revenue for the period
// @route   GET /api/reports/summary?period=daily|weekly
// @access  Private/Admin,Doctor,Receptionist
const getSummaryReport = asyncHandler(async (req, res) => {
  const period = req.query.period === 'weekly' ? 'weekly' : 'daily';
  const startDate = getStartDateForPeriod(period);
  const endDate = new Date();

  const [totalPatients, newPatients, totalAppointments, appointmentsByStatus, revenueAgg, unpaidAgg] =
    await Promise.all([
      Patient.countDocuments(),
      Patient.countDocuments({ createdAt: { $gte: startDate, $lte: endDate } }),
      Appointment.countDocuments({ date: { $gte: startDate, $lte: endDate } }),
      Appointment.aggregate([
        { $match: { date: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Bill.aggregate([
        { $match: { createdAt: { $gte: startDate, $lte: endDate }, paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Bill.aggregate([
        { $match: { createdAt: { $gte: startDate, $lte: endDate }, paymentStatus: 'unpaid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
    ]);

  const statusBreakdown = appointmentsByStatus.reduce((acc, cur) => {
    acc[cur._id] = cur.count;
    return acc;
  }, {});

  res.json({
    success: true,
    data: {
      period,
      rangeStart: startDate,
      rangeEnd: endDate,
      totalPatients,
      newPatients,
      totalAppointments,
      appointmentsByStatus: statusBreakdown,
      revenueCollected: revenueAgg[0]?.total || 0,
      revenuePending: unpaidAgg[0]?.total || 0,
    },
  });
});

module.exports = { getSummaryReport };
