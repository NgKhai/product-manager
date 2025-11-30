const { body, validationResult } = require('express-validator');

// Middleware to check validation results
const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(error => ({
                field: error.path || error.param,
                message: error.msg
            }))
        });
    }

    next();
};

// Registration validation rules
const validateRegistration = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Name can only contain letters and spaces'),

    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),

    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

    validate
];

// Login validation rules
const validateLogin = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),

    body('password')
        .notEmpty()
        .withMessage('Password is required'),

    validate
];

// Update profile validation rules
const validateProfileUpdate = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Name can only contain letters and spaces'),

    body('email')
        .optional()
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),

    validate
];

// Password change validation rules
const validatePasswordChange = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),

    body('newPassword')
        .notEmpty()
        .withMessage('New password is required')
        .isLength({ min: 8 })
        .withMessage('New password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),

    body('confirmPassword')
        .notEmpty()
        .withMessage('Password confirmation is required')
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error('Passwords do not match');
            }
            return true;
        }),

    validate
];

// Sanitize input to prevent injection attacks
const sanitizeInput = (req, res, next) => {
    // Remove any potential MongoDB operators from request body
    const sanitizeObject = (obj) => {
        for (let key in obj) {
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                sanitizeObject(obj[key]);
            } else if (typeof obj[key] === 'string') {
                // Remove potential NoSQL injection patterns
                obj[key] = obj[key].replace(/[${}]/g, '');
            }

            // Remove keys that start with $
            if (key.startsWith('$')) {
                delete obj[key];
            }
        }
    };

    if (req.body) {
        sanitizeObject(req.body);
    }

    if (req.query) {
        sanitizeObject(req.query);
    }

    if (req.params) {
        sanitizeObject(req.params);
    }

    next();
};

module.exports = {
    validate,
    validateRegistration,
    validateLogin,
    validateProfileUpdate,
    validatePasswordChange,
    sanitizeInput
};
