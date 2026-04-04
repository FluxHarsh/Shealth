
const Diagnostic = require('../models/Diagnostic');

//  GET /api/diagnostics/patient/:patientId 
const getPatientDiagnostics = async (req, res, next) => {
  try {
    const { status } = req.query; 

    const filter = { patient: req.params.patientId };
    if (status) filter.status = status;

    const diagnostics = await Diagnostic.find(filter)
      .sort({ createdAt: -1 })
      .populate('orderedBy', 'name')
      .populate('sampleCollection.slot', 'date startTime endTime');

    res.json({ success: true, count: diagnostics.length, diagnostics });
  } catch (err) {
    next(err);
  }
};

//  GET /api/diagnostics/:id 
const getDiagnosticById = async (req, res, next) => {
  try {
    const diagnostic = await Diagnostic.findById(req.params.id)
      .populate('patient', 'name phone village')
      .populate('orderedBy', 'name')
      .populate('consultation');

    if (!diagnostic) {
      return res.status(404).json({ success: false, message: 'Not found.' });
    }

    res.json({ success: true, diagnostic });
  } catch (err) {
    next(err);
  }
};

//  PATCH /api/diagnostics/:id/collected 

const markCollected = async (req, res, next) => {
  try {
    const { evVehicleId } = req.body;

    const diagnostic = await Diagnostic.findByIdAndUpdate(
      req.params.id,
      {
        status: 'sample_collected',
        'sampleCollection.collectedAt': new Date(),
        'sampleCollection.collectedBy': req.user._id,
        'sampleCollection.evVehicleId': evVehicleId,
      },
      { new: true }
    );

    if (!diagnostic) {
      return res.status(404).json({ success: false, message: 'Not found.' });
    }

    res.json({ success: true, message: 'Sample marked as collected.', diagnostic });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/diagnostics/:id/result ───────────────────────────────────────

const uploadResult = async (req, res, next) => {
  try {
    const { reportUrl, reportData, labName, labTechnicianName } = req.body;

    const diagnostic = await Diagnostic.findByIdAndUpdate(
      req.params.id,
      {
        status: 'result_ready',
        result: {
          reportUrl,
          reportData,
          uploadedAt: new Date(),
          labName,
          labTechnicianName,
        },
      },
      { new: true }
    );

    if (!diagnostic) {
      return res.status(404).json({ success: false, message: 'Not found.' });
    }


    res.json({
      success: true,
      message: 'Result uploaded. Doctor has been notified.',
      diagnostic,
    });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/diagnostics/:id/review ───────────────────────────────────────
// Doctor reviews result and writes notes
const reviewResult = async (req, res, next) => {
  try {
    const { notes, actionTaken } = req.body;

    const diagnostic = await Diagnostic.findByIdAndUpdate(
      req.params.id,
      {
        status: 'reviewed',
        doctorReview: { notes, actionTaken, reviewedAt: new Date() },
      },
      { new: true }
    );

    if (!diagnostic) {
      return res.status(404).json({ success: false, message: 'Not found.' });
    }

    res.json({ success: true, message: 'Review saved.', diagnostic });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPatientDiagnostics,
  getDiagnosticById,
  markCollected,
  uploadResult,
  reviewResult,
};
