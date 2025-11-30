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

// Create product validation rules
const validateProductCreation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Product name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Product name must be between 2 and 100 characters'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Description cannot exceed 1000 characters'),

    body('price')
        .notEmpty()
        .withMessage('Price is required')
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),

    body('category')
        .trim()
        .notEmpty()
        .withMessage('Category is required')
        .isIn(['Electronics', 'Clothing', 'Food', 'Books', 'Toys', 'Sports', 'Home', 'Beauty', 'Other'])
        .withMessage('Invalid category'),

    body('stock')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Stock must be a non-negative integer'),

    body('sku')
        .trim()
        .notEmpty()
        .withMessage('SKU is required')
        .isLength({ min: 3, max: 50 })
        .withMessage('SKU must be between 3 and 50 characters')
        .matches(/^[A-Z0-9-]+$/i)
        .withMessage('SKU can only contain letters, numbers, and hyphens'),

    body('imageUrl')
        .optional()
        .trim()
        .isURL()
        .withMessage('Please provide a valid URL for the image'),

    body('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array'),

    body('tags.*')
        .optional()
        .trim()
        .isLength({ min: 1, max: 30 })
        .withMessage('Each tag must be between 1 and 30 characters'),

    validate
];

// Update product validation rules
const validateProductUpdate = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Product name must be between 2 and 100 characters'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Description cannot exceed 1000 characters'),

    body('price')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),

    body('category')
        .optional()
        .trim()
        .isIn(['Electronics', 'Clothing', 'Food', 'Books', 'Toys', 'Sports', 'Home', 'Beauty', 'Other'])
        .withMessage('Invalid category'),

    body('stock')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Stock must be a non-negative integer'),

    body('sku')
        .optional()
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage('SKU must be between 3 and 50 characters')
        .matches(/^[A-Z0-9-]+$/i)
        .withMessage('SKU can only contain letters, numbers, and hyphens'),

    body('imageUrl')
        .optional()
        .trim()
        .isURL()
        .withMessage('Please provide a valid URL for the image'),

    body('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array'),

    body('tags.*')
        .optional()
        .trim()
        .isLength({ min: 1, max: 30 })
        .withMessage('Each tag must be between 1 and 30 characters'),

    body('isActive')
        .optional()
        .isBoolean()
        .withMessage('isActive must be a boolean value'),

    validate
];

module.exports = {
    validateProductCreation,
    validateProductUpdate
};
