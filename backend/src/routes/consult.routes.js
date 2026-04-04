// routes/consult.routes.js — Mounted at /api/consult
const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const {
  bookConsultation, getDoctorQueue, getConsultation,
  startCall, endCall, submitDoctorNotes, submitFeedback, getMyConsultations,
} = require('../controllers/consult.controller');
 
router.use(protect);
 
router.post(
  '/book',
  authorize('patient', 'whf'),
  [
    body('assessmentId').notEmpty().withMessage('assessmentId required'),
    body('doctorId').notEmpty().withMessage('doctorId required'),
  ],
  validate,
  bookConsultation
);
 
// IMPORTANT: specific named routes before /:id param routes
router.get('/queue', authorize('doctor'), getDoctorQueue);
router.get('/my-history', getMyConsultations);
router.get('/:id', getConsultation);
router.patch('/:id/start', startCall);
router.patch('/:id/end', authorize('doctor'), endCall);
router.patch(
  '/:id/notes',
  authorize('doctor'),
  [body('diagnosis').notEmpty().withMessage('Diagnosis is required')],
  validate,
  submitDoctorNotes
);
router.post('/:id/feedback', authorize('patient'), submitFeedback);
 
module.exports = router ;
 