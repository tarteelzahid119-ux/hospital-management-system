const { body } = require('express-validator');

const billValidator = [
  body('patient').isMongoId().withMessage('Valid patient ID is required'),
  body('appointment').optional().isMongoId().withMessage('Appointment ID must be valid'),
  body('treatments').isArray({ min: 1 }).withMessage('At least one treatment item is required'),
  body('treatments.*.name').notEmpty().withMessage('Treatment name is required'),
  body('treatments.*.charge').isFloat({ min: 0 }).withMessage('Charge must be a positive number'),
  body('paymentMethod').optional().isIn(['cash', 'card', 'insurance', 'online']),
];

const paymentStatusValidator = [
  body('paymentStatus').isIn(['paid', 'unpaid']).withMessage('paymentStatus must be paid or unpaid'),
];

module.exports = { billValidator, paymentStatusValidator };
