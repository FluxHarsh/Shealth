const router = require('express').Router();
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  sendOtp,
  verifyOtp,
  loginWithPassword,
  getMe,
} = require('../controllers/auth.controller');


router.post(
  '/send-otp',
  [
    body('phone')
      .matches(/^[6-9]\d{9}$/)
      .withMessage('Enter a valid 10-digit Indian mobile number'),
    body('name')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be 2–100 characters'),
    body('role')
      .optional()
      .isIn(['patient', 'whf', 'doctor'])
      .withMessage('Role must be patient, whf, or doctor'),
  ],
  validate,
  sendOtp
);

router.post(
  '/verify-otp',
  [
    body('phone').matches(/^[6-9]\d{9}$/).withMessage('Invalid phone number'),
    body('otp').isLength({ min: 6, max: 6 }).isNumeric().withMessage('OTP must be 6 digits'),
  ],
  validate,
  verifyOtp
);

router.post(
  '/login',
  [
    body('phone').matches(/^[6-9]\d{9}$/).withMessage('Invalid phone number'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  loginWithPassword
);


router.get('/me', protect, getMe);

module.exports = router;
