// routes/diagnostics.routes.js — Mounted at /api/diagnostics
// ════════════════════════════════════════════════════════
const router = require('express').Router();

const { protect, authorize } = require('../middleware/auth');

const {
  getPatientDiagnostics, getDiagnosticById,
  markCollected, uploadResult, reviewResult,
} = require('../controllers/diagnostics.controller');
 
router.use(protect);
 
router.get('/patient/:patientId', getPatientDiagnostics);
router.get('/:id', getDiagnosticById);
router.patch('/:id/collected', authorize('whf'), markCollected);
router.patch('/:id/result', uploadResult); // Lab technician
router.patch('/:id/review', authorize('doctor'), reviewResult);
 
module.exports = router;