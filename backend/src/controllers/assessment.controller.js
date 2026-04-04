const Assessment = require('../models/Assessment');
const { checkVitalsAlerts, alertsToUrgency } = require('../utils/vitalsAlert');


const callAIService = async (endpoint, payload) => {
  try {
    const response = await fetch(`${process.env.AI_SERVICE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.AI_API_KEY}`,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000), 
    });

    if (!response.ok) throw new Error(`AI service error: ${response.status}`);
    return await response.json();
  } catch (err) {
    console.warn(`⚠️  AI service unavailable (${err.message}). Using fallback.`);
    return null; 
  }
};


const FALLBACK_QUESTIONS = [
  { questionId: 'q1', question: 'What is your main health concern today?', category: 'symptom' },
  { questionId: 'q2', question: 'How long have you been experiencing this?', category: 'duration' },
  { questionId: 'q3', question: 'On a scale of 1–10, how severe is it?', category: 'severity' },
  { questionId: 'q4', question: 'Do you have any fever, headache, or dizziness?', category: 'symptom' },
  { questionId: 'q5', question: 'Are you currently pregnant or breastfeeding?', category: 'history' },
  { questionId: 'q6', question: 'Do you have any known conditions like diabetes or BP?', category: 'history' },
  { questionId: 'q7', question: 'Are you currently taking any medicines?', category: 'history' },
  { questionId: 'q8', question: 'How has your sleep and appetite been recently?', category: 'lifestyle' },
];

// POST /api/assessment/start 
const startAssessment = async (req, res, next) => {
  try {
    const { conductedBy, vitalsSnapshot } = req.body;
    const patientId = req.user.role === 'patient'
      ? req.user._id
      : req.body.patientId; 

    if (!patientId) {
      return res.status(400).json({ success: false, message: 'patientId is required.' });
    }


    const existing = await Assessment.findOne({ patient: patientId, status: 'in_progress' });
    if (existing) {
      return res.json({
        success: true,
        message: 'Resuming existing session.',
        assessment: existing,
        nextQuestion: existing.qa.find(q => !q.answer) || existing.qa[existing.qa.length - 1],
      });
    }


    const aiResponse = await callAIService('/start', { patientId });
    const firstQuestion = aiResponse?.question || FALLBACK_QUESTIONS[0];


    const assessment = await Assessment.create({
      patient: patientId,
      conductedBy: conductedBy || null,
      vitalsSnapshot: vitalsSnapshot || null,
      qa: [{
        questionId: firstQuestion.questionId,
        question: firstQuestion.question,
        category: firstQuestion.category,
      }],
    });

    res.status(201).json({
      success: true,
      message: 'Assessment started.',
      assessmentId: assessment._id,
      nextQuestion: {
        questionId: firstQuestion.questionId,
        question: firstQuestion.question,
        questionNumber: 1,
        totalExpected: 8,
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/assessment/:id/answer 

const submitAnswer = async (req, res, next) => {
  try {
    const { answer } = req.body;
    const assessment = await Assessment.findById(req.params.id);

    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found.' });
    }

    if (assessment.status !== 'in_progress') {
      return res.status(400).json({ success: false, message: 'Assessment is already completed.' });
    }


    const unansweredIndex = assessment.qa.findIndex(q => !q.answer);
    if (unansweredIndex === -1) {
      return res.status(400).json({ success: false, message: 'All questions already answered.' });
    }

    assessment.qa[unansweredIndex].answer = answer;
    assessment.qa[unansweredIndex].answeredAt = new Date();

    const questionNumber = unansweredIndex + 1;


    const aiResponse = await callAIService('/next-question', {
      assessmentId: assessment._id,
      qa: assessment.qa,
      questionNumber,
    });


    const isDone = aiResponse?.done || questionNumber >= 8;

    if (!isDone) {

      const nextQ = aiResponse?.question || FALLBACK_QUESTIONS[questionNumber];
      assessment.qa.push({
        questionId: nextQ.questionId,
        question: nextQ.question,
        category: nextQ.category,
      });
      await assessment.save();

      return res.json({
        success: true,
        done: false,
        nextQuestion: {
          questionId: nextQ.questionId,
          question: nextQ.question,
          questionNumber: questionNumber + 1,
          totalExpected: 8,
        },
      });
    }


    await assessment.save();

    res.json({
      success: true,
      done: true,
      message: 'All questions answered. Ready to generate report.',
      assessmentId: assessment._id,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/assessment/:id/complete
const generateReport = async (req, res, next) => {
  try {
    const assessment = await Assessment.findById(req.params.id);

    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found.' });
    }


    const aiReport = await callAIService('/generate-report', {
      assessmentId: assessment._id,
      qa: assessment.qa,
      vitals: assessment.vitalsSnapshot,
    });


    const report = aiReport || generateFallbackReport(assessment.qa);


    if (assessment.vitalsSnapshot) {
      const alerts = checkVitalsAlerts(assessment.vitalsSnapshot);
      const vitalsUrgency = alertsToUrgency(alerts);

      const urgencyRank = { routine: 0, priority: 1, urgent: 2 };
      if (urgencyRank[vitalsUrgency] > urgencyRank[report.urgencyLevel || 'routine']) {
        report.urgencyLevel = vitalsUrgency;
      }
    }

    assessment.report = report;
    assessment.status = 'completed';
    assessment.completedAt = new Date();
    await assessment.save();

    res.json({
      success: true,
      message: 'Report generated successfully.',
      report: assessment.report,
      assessmentId: assessment._id,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/assessment/:id

const getAssessment = async (req, res, next) => {
  try {
    const assessment = await Assessment.findById(req.params.id)
      .populate('patient', 'name phone age village district')
      .populate('conductedBy', 'name phone');

    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found.' });
    }


    if (req.user.role === 'patient' &&
        assessment.patient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({ success: true, assessment });
  } catch (err) {
    next(err);
  }
};

// GET /api/assessment/my-history 
const getMyHistory = async (req, res, next) => {
  try {
    const assessments = await Assessment.find({
      patient: req.user._id,
      status: 'completed',
    })
      .sort({ completedAt: -1 })
      .limit(20)
      .select('report.symptomsSummary report.urgencyLevel completedAt consultation');

    res.json({ success: true, count: assessments.length, assessments });
  } catch (err) {
    next(err);
  }
};

// ─── Fallback report generator ───────────────────────────────────────────────
// Used when AI service is unavailable — creates a basic report from Q&A
const generateFallbackReport = (qa) => {
  const answered = qa.filter(q => q.answer);
  const firstAnswer = answered[0]?.answer || 'Not specified';
  const durationAnswer = answered.find(q => q.category === 'duration')?.answer || 'Not specified';
  const severityAnswer = answered.find(q => q.category === 'severity')?.answer || '';

  // Rough severity detection from text
  const severityNum = parseInt(severityAnswer);
  let severity = 'mild';
  if (severityNum >= 7) severity = 'severe';
  else if (severityNum >= 4) severity = 'moderate';

  return {
    symptomsSummary: `Patient reports: ${firstAnswer}`,
    duration: durationAnswer,
    severity,
    keyObservations: answered.map(q => `${q.question}: ${q.answer}`),
    possibleConcerns: [],
    urgencyLevel: severity === 'severe' ? 'priority' : 'routine',
    recommendedTests: [],
    generatedAt: new Date(),
  };
};

module.exports = { startAssessment, submitAnswer, generateReport, getAssessment, getMyHistory };
