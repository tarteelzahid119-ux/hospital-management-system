const { body } = require('express-validator');

const patientValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('age').isInt({ min: 0, max: 150 }).withMessage('Age must be a valid number'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Gender must be male, female, or other'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('email').optional().isEmail().withMessage('Email must be valid'),
];

module.exports = { patientValidator };
