const router = require('express').Router();
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { recordVitals, getPatientVitals, getVitalsById } = require('../controllers/vitals.controller');
 
router.use(protect);
 
router.post(
  '/',
  authorize('whf', 'doctor'),
  [
    body('patientId').notEmpty().withMessage('patientId is required'),
    body('bloodPressure.systolic').optional().isInt({ min: 50, max: 250 }).withMessage('Invalid systolic BP'),
    body('bloodPressure.diastolic').optional().isInt({ min: 30, max: 150 }).withMessage('Invalid diastolic BP'),
    body('hemoglobin').optional().isFloat({ min: 1, max: 25 }).withMessage('Invalid hemoglobin value'),
    body('bloodSugar.value').optional().isFloat({ min: 20, max: 600 }).withMessage('Invalid blood sugar'),
  ],
  validate,
  recordVitals
);
 

router.get('/patient/:patientId', getPatientVitals);
router.get('/:id', getVitalsById);
 
module.exports = router ;
