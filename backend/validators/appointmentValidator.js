const { body } = require('express-validator');

const appointmentValidator = [
  body('patient').isMongoId().withMessage('Valid patient ID is required'),
  body('doctor').isMongoId().withMessage('Valid doctor ID is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('startTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('startTime must be in HH:MM format'),
  body('endTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('endTime must be in HH:MM format'),
  body('reason').optional().isString(),
];

const statusValidator = [
  body('status').isIn(['pending', 'confirmed', 'completed', 'cancelled']).withMessage('Invalid status'),
];

module.exports = { appointmentValidator, statusValidator };
