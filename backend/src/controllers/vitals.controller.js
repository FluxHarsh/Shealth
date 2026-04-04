const Vitals = require('../models/Vitals');
const User = require('../models/User');
const { checkVitalsAlerts } = require('../utils/vitalsAlert');

//  POST /api/vitals 
const recordVitals = async (req, res, next) => {
  try {
    const {
      patientId,
      bloodPressure,   
      hemoglobin,
      bloodSugar,     
      weight,
      height,
      temperature,
      oxygenSaturation,
      pulseRate,
      recordedAt,
      notes,
      assessmentId,
    } = req.body;

    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ success: false, message: 'Patient not found.' });
    }

    const alerts = checkVitalsAlerts({
      bloodPressure,
      hemoglobin,
      bloodSugar,
      temperature,
      oxygenSaturation,
    });

    let bmi;
    if (weight && height) {
      const heightM = height / 100;
      bmi = parseFloat((weight / (heightM * heightM)).toFixed(1));
    }

    const vitals = await Vitals.create({
      patient: patientId,
      recordedBy: req.user._id, 
      bloodPressure,
      hemoglobin,
      bloodSugar,
      weight,
      height,
      bmi,
      temperature,
      oxygenSaturation,
      pulseRate,
      recordedAt: recordedAt || 'hub',
      notes,
      alerts,
      assessment: assessmentId || null,
    });


    const alertMessages = {
      high_bp: 'High blood pressure detected — refer to doctor urgently',
      low_bp: 'Low blood pressure — patient may feel faint',
      anemia_risk: 'Low hemoglobin — anemia risk detected',
      high_sugar: 'High blood sugar — diabetes risk',
      low_sugar: 'Low blood sugar — needs immediate attention',
      low_oxygen: 'Low oxygen saturation — needs urgent care',
      fever: 'Fever detected',
    };

    const alertsForUI = alerts.map(code => ({
      code,
      message: alertMessages[code] || code,
      severity: ['high_bp', 'low_oxygen', 'low_sugar'].includes(code) ? 'urgent' : 'warning',
    }));

    res.status(201).json({
      success: true,
      message: 'Vitals recorded successfully.',
      vitals,
      alerts: alertsForUI,
      hasAlerts: alerts.length > 0,
    });
  } catch (err) {
    next(err);
  }
};

//  GET /api/vitals/patient/:patientId 
const getPatientVitals = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const { limit = 10 } = req.query;


    if (req.user.role === 'patient' && req.user._id.toString() !== patientId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const vitals = await Vitals.find({ patient: patientId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('recordedBy', 'name');

    const trend = buildTrendSummary(vitals);

    res.json({ success: true, count: vitals.length, vitals, trend });
  } catch (err) {
    next(err);
  }
};

// GET /api/vitals/:id 
const getVitalsById = async (req, res, next) => {
  try {
    const vitals = await Vitals.findById(req.params.id)
      .populate('patient', 'name phone age')
      .populate('recordedBy', 'name');

    if (!vitals) {
      return res.status(404).json({ success: false, message: 'Vitals record not found.' });
    }

    res.json({ success: true, vitals });
  } catch (err) {
    next(err);
  }
};

//  Helper: build trend summary 
const buildTrendSummary = (vitalsArray) => {
  if (vitalsArray.length < 2) return null;

  const latest = vitalsArray[0];
  const previous = vitalsArray[1];

  const trend = (curr, prev) => {
    if (!curr || !prev) return null;
    if (curr > prev) return 'increasing';
    if (curr < prev) return 'decreasing';
    return 'stable';
  };

  return {
    hemoglobin: {
      latest: latest.hemoglobin,
      previous: previous.hemoglobin,
      trend: trend(latest.hemoglobin, previous.hemoglobin),
    },
    systolic: {
      latest: latest.bloodPressure?.systolic,
      previous: previous.bloodPressure?.systolic,
      trend: trend(latest.bloodPressure?.systolic, previous.bloodPressure?.systolic),
    },
    weight: {
      latest: latest.weight,
      previous: previous.weight,
      trend: trend(latest.weight, previous.weight),
    },
  };
};

module.exports = { recordVitals, getPatientVitals, getVitalsById };
