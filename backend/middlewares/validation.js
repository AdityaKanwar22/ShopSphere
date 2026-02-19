import { body, validationResult } from 'express-validator';
import mongoSanitize from 'express-mongo-sanitize';


export const sanitizeData = mongoSanitize();

export const registerValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .escape(),

    body('email')
        .isEmail().withMessage('Please enter a valid email')
        .normalizeEmail(),

    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/\d/).withMessage('Password must contain a number')
        .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.json({ success: false, message: errors.array()[0].msg });
        }
        next();
    }
];

export const loginValidation = [
    body('email')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.json({ success: false, message: errors.array()[0].msg });
        }
        next();
    }
];
