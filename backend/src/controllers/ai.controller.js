const Assessment = require('../models/Assessment');

const callAIService = async (endpoint, payload) => {
  const response = await fetch(`${process.env.AI_SERVICE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(30000), 
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`AI service error ${response.status}: ${err}`);
  }
  return response.json();
};

// ─── POST /api/ai/image/analyze ──────────────────────────────────────────────

const analyzeImage = async (req, res, next) => {
  try {
    const { base64_image, mime_type = 'image/jpeg', context, assessmentId } = req.body;

    if (!base64_image) {
      return res.status(400).json({ success: false, message: 'base64_image is required.' });
    }

    const result = await callAIService('/image/analyze', {
      base64_image,
      mime_type,
      context: context || null,
      patientId: req.user._id.toString(),
    });

    if (assessmentId && result.success) {
      Assessment.findByIdAndUpdate(assessmentId, {
        $set: { 'imageAnalysis': result.analysis }
      }).catch(err => console.warn('Could not save image analysis to assessment:', err.message));
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
};

//  POST /api/ai/voice/transcribe 

const transcribeVoice = async (req, res, next) => {
  try {
    const { base64_audio, mime_type = 'audio/webm', language = 'hi' } = req.body;

    if (!base64_audio) {
      return res.status(400).json({ success: false, message: 'base64_audio is required.' });
    }

    const result = await callAIService('/voice/transcribe', {
      base64_audio,
      mime_type,
      language,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
};

//  POST /api/ai/voice/speak 

const speakText = async (req, res, next) => {
  try {
    const { text, language = 'hi' } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, message: 'text is required.' });
    }

    const result = await callAIService('/voice/speak', { text, language });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

//  POST /api/ai/report/pdf/:assessmentId 

const downloadReportPDF = async (req, res, next) => {
  try {
    const assessment = await Assessment.findById(req.params.assessmentId)
      .populate('patient', 'name phone age village district');

    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found.' });
    }
    if (assessment.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Assessment not completed yet.' });
    }


    if (req.user.role === 'patient' &&
        assessment.patient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }


    const pdfResponse = await fetch(`${process.env.AI_SERVICE_URL}/report/generate-pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assessmentId: assessment._id.toString(),
        qa:           assessment.qa,
        vitals:       assessment.vitalsSnapshot || null,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!pdfResponse.ok) throw new Error(`PDF generation failed: ${pdfResponse.status}`);


    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=shealth_report_${assessment._id}.pdf`);
    const arrayBuffer = await pdfResponse.arrayBuffer();
    res.end(Buffer.from(arrayBuffer));
  } catch (err) {
    next(err);
  }
};

module.exports = { analyzeImage, transcribeVoice, speakText, downloadReportPDF };
