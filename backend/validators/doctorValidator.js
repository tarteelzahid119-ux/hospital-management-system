const { body } = require('express-validator');

// Validation for creating a new doctor
const createDoctorValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required'),

  body('specialization')
    .trim()
    .notEmpty()
    .withMessage('Specialization is required'),

  body('email')
    .isEmail()
    .withMessage('Valid email is required'),

  body('phone')
    .notEmpty()
    .withMessage('Phone is required'),

  body('availability')
    .optional()
    .isArray()
    .withMessage('Availability must be an array'),

  body('consultationFee')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Fee must be a positive number'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),

  body('linkedUser')
    .optional()
    .isMongoId()
    .withMessage('linkedUser must be a valid MongoDB ID'),
];

// Validation for updating an existing doctor
// All fields are optional because PUT/PATCH-style updates
// should allow updating only the fields provided.
const updateDoctorValidator = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty'),

  body('specialization')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Specialization cannot be empty'),

  body('email')
    .optional()
    .isEmail()
    .withMessage('Valid email is required'),

  body('phone')
    .optional()
    .notEmpty()
    .withMessage('Phone cannot be empty'),

  body('availability')
    .optional()
    .isArray()
    .withMessage('Availability must be an array'),

  body('consultationFee')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Fee must be a positive number'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),

  body('linkedUser')
    .optional()
    .isMongoId()
    .withMessage('linkedUser must be a valid MongoDB ID'),
];

module.exports = {
  createDoctorValidator,
  updateDoctorValidator,
};