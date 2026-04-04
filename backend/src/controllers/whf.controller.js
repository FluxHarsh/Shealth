const User = require('../models/User');
const Assessment = require('../models/Assessment.js');
const Vitals = require('../models/Vitals');
const Consultation = require('../models/Consultation');
const Diagnostic = require('../models/Diagnostic');

//  GET /api/whf/dashboard 
const getDashboard = async (req, res, next) => {
  try {
    const whf = req.user;


    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);


    const villagePatients = await User.countDocuments({
      village: whf.village,
      role: 'patient',
    });


    const todayAssessments = await Assessment.countDocuments({
      conductedBy: whf._id,
      createdAt: { $gte: todayStart, $lte: todayEnd },
    });


    const todayVitals = await Vitals.countDocuments({
      recordedBy: whf._id,
      createdAt: { $gte: todayStart, $lte: todayEnd },
    });


    const pendingCollections = await Diagnostic.find({
      status: 'ordered',
    })
      .populate('patient', 'name village')
      .limit(5);

    const collectionsInVillage = pendingCollections.filter(
      d => d.patient?.village === whf.village
    );


    const recentVitals = await Vitals.find({
      recordedBy: whf._id,
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    })
      .populate('patient', 'name age')
      .sort({ createdAt: -1 })
      .limit(5);


    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthVitals = await Vitals.countDocuments({
      recordedBy: whf._id,
      createdAt: { $gte: monthStart },
    });

    const monthAssessments = await Assessment.countDocuments({
      conductedBy: whf._id,
      createdAt: { $gte: monthStart },
    });

    const estimatedEarnings = (monthVitals * 50) + (monthAssessments * 100);

    res.json({
      success: true,
      dashboard: {
        whf: { name: whf.name, village: whf.village },
        today: {
          assessmentsConducted: todayAssessments,
          vitalsRecorded: todayVitals,
          pendingCollections: collectionsInVillage.length,
        },
        village: {
          totalPatients: villagePatients,
        },
        recentPatients: recentVitals.map(v => ({
          name: v.patient?.name,
          age: v.patient?.age,
          visitedAt: v.createdAt,
          hasAlerts: v.alerts?.length > 0,
        })),
        earnings: {
          thisMonth: estimatedEarnings,
          vitalsCount: monthVitals,
          assistedConsults: monthAssessments,
          breakdown: `${monthVitals} vitals × ₹50 + ${monthAssessments} assessments × ₹100`,
        },
        pendingCollections: collectionsInVillage.slice(0, 3),
      },
    });
  } catch (err) {
    next(err);
  }
};

//  GET /api/whf/patients 
const getVillagePatients = async (req, res, next) => {
  try {
    const patients = await User.find({
      village: req.user.village,
      role: 'patient',
    }).select('name age phone createdAt').sort({ name: 1 });

    res.json({ success: true, count: patients.length, patients });
  } catch (err) {
    next(err);
  }
};

//  GET /api/whf/earnings 
const getEarnings = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const targetMonth = parseInt(month) || new Date().getMonth();
    const targetYear = parseInt(year) || new Date().getFullYear();

    const start = new Date(targetYear, targetMonth, 1);
    const end = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

    const vitalsCount = await Vitals.countDocuments({
      recordedBy: req.user._id,
      createdAt: { $gte: start, $lte: end },
    });

    const assessmentCount = await Assessment.countDocuments({
      conductedBy: req.user._id,
      createdAt: { $gte: start, $lte: end },
    });

    const VITALS_RATE = 50;     
    const CONSULT_RATE = 100;   
    res.json({
      success: true,
      earnings: {
        period: `${start.toLocaleString('default', { month: 'long' })} ${targetYear}`,
        vitals: { count: vitalsCount, rate: VITALS_RATE, total: vitalsCount * VITALS_RATE },
        consultations: { count: assessmentCount, rate: CONSULT_RATE, total: assessmentCount * CONSULT_RATE },
        total: (vitalsCount * VITALS_RATE) + (assessmentCount * CONSULT_RATE),
        target: 12000, 
      },
    });
  } catch (err) {
    next(err);
  }
};

//  GET /api/whf/pending-collections 
const getPendingCollections = async (req, res, next) => {
  try {
    const diagnostics = await Diagnostic.find({ status: 'ordered' })
      .populate({ path: 'patient', match: { village: req.user.village }, select: 'name phone village' })
      .populate('consultation', 'scheduledAt');


    const inVillage = diagnostics.filter(d => d.patient !== null);

    res.json({ success: true, count: inVillage.length, collections: inVillage });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard, getVillagePatients, getEarnings, getPendingCollections };
