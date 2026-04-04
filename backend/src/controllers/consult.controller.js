const Consultation = require('../models/Consultation');
const Assessment = require('../models/Assessment.js');
const Diagnostic = require('../models/Diagnostic');
const Slot = require('../models/Slot');

// ─── POST /api/consult/book ───────────────────────────────────────────────────

const bookConsultation = async (req, res, next) => {
  try {
    const { assessmentId, doctorId, scheduledAt } = req.body;

    // Verify assessment exists and belongs to this patient
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found.' });
    }
    if (assessment.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Complete the assessment first.' });
    }
    if (assessment.consultation) {
      return res.status(400).json({ success: false, message: 'Consultation already booked for this assessment.' });
    }

    // Create consultation
    const consultation = await Consultation.create({
      patient: assessment.patient,
      doctor: doctorId,
      assessment: assessmentId,
      scheduledAt: scheduledAt || new Date(Date.now() + 30 * 60 * 1000), // Default: 30 min from now
      // Jitsi room name: unique per consultation
      jitsiRoomName: `shealth-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    });

    // Link assessment back to consultation
    assessment.consultation = consultation._id;
    await assessment.save();

    res.status(201).json({
      success: true,
      message: 'Consultation booked.',
      consultation: {
        id: consultation._id,
        scheduledAt: consultation.scheduledAt,
        jitsiRoomName: consultation.jitsiRoomName,
        // Full Jitsi URL — frontend embeds this in an iframe
        jitsiUrl: `https://${process.env.JITSI_DOMAIN}/${consultation.jitsiRoomName}`,
        status: consultation.status,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/consult/queue ───────────────────────────────────────────────────
// Doctor's pending consultation queue — sorted by urgency then time
const getDoctorQueue = async (req, res, next) => {
  try {
    // Only doctors can access this
    const consultations = await Consultation.find({
      doctor: req.user._id,
      status: { $in: ['scheduled', 'ongoing'] },
    })
      .populate('patient', 'name phone age village district')
      .populate({
        path: 'assessment',
        select: 'report.urgencyLevel report.symptomsSummary report.severity vitalsSnapshot',
      })
      .sort({ scheduledAt: 1 }); // Earliest first, then we sort by urgency below

    // Sort: urgent first, then priority, then routine
    const urgencyOrder = { urgent: 0, priority: 1, routine: 2 };
    consultations.sort((a, b) => {
      const aUrgency = a.assessment?.report?.urgencyLevel || 'routine';
      const bUrgency = b.assessment?.report?.urgencyLevel || 'routine';
      return urgencyOrder[aUrgency] - urgencyOrder[bUrgency];
    });

    // Add urgency badge info for each entry
    const queue = consultations.map(c => ({
      id: c._id,
      patient: c.patient,
      scheduledAt: c.scheduledAt,
      status: c.status,
      urgencyLevel: c.assessment?.report?.urgencyLevel || 'routine',
      symptomsSummary: c.assessment?.report?.symptomsSummary,
      severity: c.assessment?.report?.severity,
      jitsiUrl: `https://${process.env.JITSI_DOMAIN}/${c.jitsiRoomName}`,
      assessmentId: c.assessment?._id,
    }));

    res.json({ success: true, count: queue.length, queue });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/consult/:id ─────────────────────────────────────────────────────
// Full consultation detail — doctor uses this before joining the call
const getConsultation = async (req, res, next) => {
  try {
    const consultation = await Consultation.findById(req.params.id)
      .populate('patient', 'name phone age gender village district')
      .populate('doctor', 'name phone')
      .populate({
        path: 'assessment',
        populate: { path: 'conductedBy', select: 'name' },
      });

    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation not found.' });
    }

    // Attach Jitsi URL
    const data = consultation.toObject();
    data.jitsiUrl = `https://${process.env.JITSI_DOMAIN}/${consultation.jitsiRoomName}`;

    res.json({ success: true, consultation: data });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/consult/:id/start ─────────────────────────────────────────────
// Called when either party clicks "Join Call"
const startCall = async (req, res, next) => {
  try {
    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Not found.' });
    }

    consultation.status = 'ongoing';
    consultation.startedAt = new Date();
    await consultation.save();

    res.json({
      success: true,
      message: 'Call started.',
      jitsiUrl: `https://${process.env.JITSI_DOMAIN}/${consultation.jitsiRoomName}`,
    });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/consult/:id/end ───────────────────────────────────────────────
// Called when doctor ends the call
const endCall = async (req, res, next) => {
  try {
    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Not found.' });
    }

    consultation.status = 'completed';
    consultation.endedAt = new Date();

    if (consultation.startedAt) {
      const ms = consultation.endedAt - consultation.startedAt;
      consultation.durationMinutes = Math.round(ms / 60000);
    }

    await consultation.save();

    res.json({
      success: true,
      message: 'Call ended.',
      durationMinutes: consultation.durationMinutes,
    });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/consult/:id/notes ─────────────────────────────────────────────
// Doctor submits post-call: diagnosis, prescription, ordered tests
const submitDoctorNotes = async (req, res, next) => {
  try {
    const { diagnosis, prescription, testsOrdered, followUpDate, followUpNotes, referral } = req.body;

    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Not found.' });
    }

    // Only the assigned doctor can submit notes
    if (consultation.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the assigned doctor can submit notes.' });
    }

    consultation.doctorNotes = {
      diagnosis,
      prescription: prescription || [],
      testsOrdered: testsOrdered || [],
      followUpDate,
      followUpNotes,
      referral: referral || { needed: false },
    };

    // If tests were ordered, create Diagnostic records and schedule EV pickup
    if (testsOrdered && testsOrdered.length > 0) {
      const diagnostic = await Diagnostic.create({
        patient: consultation.patient,
        orderedBy: req.user._id,
        consultation: consultation._id,
        testsOrdered: testsOrdered.map(name => ({ name, priority: 'routine' })),
        expectedResultBy: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      });

      // Try to auto-book the next available EV slot for patient's village
      await autoBookEVSlot(consultation.patient, diagnostic._id);
    }

    await consultation.save();

    res.json({
      success: true,
      message: 'Notes saved. Prescription sent to patient.',
      consultation,
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/consult/:id/feedback ──────────────────────────────────────────
const submitFeedback = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Not found.' });
    }

    consultation.patientFeedback = { rating, comment, submittedAt: new Date() };
    await consultation.save();

    res.json({ success: true, message: 'Thank you for your feedback.' });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/consult/my-history ─────────────────────────────────────────────
const getMyConsultations = async (req, res, next) => {
  try {
    const filter = req.user.role === 'patient'
      ? { patient: req.user._id }
      : { doctor: req.user._id };

    const consultations = await Consultation.find({ ...filter, status: 'completed' })
      .sort({ scheduledAt: -1 })
      .limit(20)
      .populate('patient', 'name village')
      .populate('doctor', 'name')
      .select('scheduledAt durationMinutes doctorNotes.diagnosis status');

    res.json({ success: true, count: consultations.length, consultations });
  } catch (err) {
    next(err);
  }
};

// ─── Helper: auto-book next EV slot ──────────────────────────────────────────
const autoBookEVSlot = async (patientId, diagnosticId) => {
  try {
    const User = require('../models/User');
    const patient = await User.findById(patientId);
    if (!patient?.village) return;

    // Find next open morning collection slot in patient's village
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const slot = await Slot.findOne({
      village: patient.village,
      type: 'collection',
      status: 'open',
      date: { $gte: tomorrow },
    }).sort({ date: 1 });

    if (!slot) return; // No slot available — WHF will manually schedule

    slot.bookings.push({
      patient: patientId,
      diagnostic: diagnosticId,
      address: `${patient.village}, ${patient.district}`,
    });

    if (slot.bookings.length >= slot.maxCapacity) {
      slot.status = 'full';
    }

    await slot.save();

    // Update diagnostic with the slot reference
    await Diagnostic.findByIdAndUpdate(diagnosticId, {
      'sampleCollection.slot': slot._id,
    });
  } catch (err) {
    console.warn('Auto-slot booking failed:', err.message);
    // Non-critical — don't propagate this error
  }
};

module.exports = {
  bookConsultation,
  getDoctorQueue,
  getConsultation,
  startCall,
  endCall,
  submitDoctorNotes,
  submitFeedback,
  getMyConsultations,
};