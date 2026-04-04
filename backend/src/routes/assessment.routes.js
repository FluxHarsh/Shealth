const router = require('express').Router();
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  startAssessment,
  submitAnswer,
  generateReport,
  getAssessment,
  getMyHistory,
} = require('../controllers/assessment.controller');

router.use(protect); 

router.post(
  '/start',
  authorize('patient', 'whf'),
  [
    body('patientId')
      .if((value, { req }) => req.user.role === 'whf')
      .notEmpty().withMessage('patientId required when WHF starts assessment'),
  ],
  validate,
  startAssessment
);


router.get('/my-history', authorize('patient'), getMyHistory);

router.post(
  '/:id/answer',
  authorize('patient', 'whf'),
  [body('answer').notEmpty().withMessage('Answer cannot be empty')],
  validate,
  submitAnswer
);

router.post('/:id/complete', authorize('patient', 'whf'), generateReport);

router.get('/:id', getAssessment); 
module.exports = router;