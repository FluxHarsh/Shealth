const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { analyzeImage, transcribeVoice, speakText, downloadReportPDF } = require('../controllers/ai.controller');

router.use(protect); 

router.post('/image/analyze', authorize('patient', 'whf', 'doctor'), analyzeImage);


router.post('/voice/transcribe', authorize('patient', 'whf'), transcribeVoice);
router.post('/voice/speak',      authorize('patient', 'whf', 'doctor'), speakText);


router.post('/report/pdf/:assessmentId', downloadReportPDF);

module.exports = router;
