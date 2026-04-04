const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const User = require('../models/User');
const Slot = require('../models/Slot');
const Assessment = require('../models/Assessment.js');

const connectDB = require('../config/db');

const DEMO_VILLAGE = 'Sehore';
const DEMO_DISTRICT = 'Sehore';

const seed = async () => {
  await connectDB();

  console.log('\n🌱 Seeding demo data...\n');


  await User.deleteMany({ phone: /^900000000/ });
  await Slot.deleteMany({ village: DEMO_VILLAGE });
  console.log('🗑  Cleared old demo data');


const [patient, whf, doctor] = await User.insertMany([
  {
    name: 'Radha Devi',
    phone: '9000000001',
    role: 'patient',
    age: 28,
    gender: 'female',
    village: DEMO_VILLAGE,
    district: DEMO_DISTRICT,
    state: 'Madhya Pradesh',
  },
  {
    name: 'Sunita Patel',
    phone: '9000000002',
    role: 'whf',
    village: DEMO_VILLAGE,
    district: DEMO_DISTRICT,
  },
  {
    name: 'Dr. Priya Sharma',
    phone: '9000000003',
    role: 'doctor',
    district: DEMO_DISTRICT,
  }
]);

  console.log('👤 Created demo users:');
  console.log(`   Patient : ${patient.name} | phone: 9000000001 | OTP: 123456`);
  console.log(`   WHF     : ${whf.name}    | phone: 9000000002 | OTP: 123456`);
  console.log(`   Doctor  : ${doctor.name} | phone: 9000000003 | OTP: 123456`);

  const slots = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i + 1);
    date.setHours(0, 0, 0, 0);

    slots.push(
      { date, type: 'collection', startTime: '07:00', endTime: '09:00', village: DEMO_VILLAGE, district: DEMO_DISTRICT, evVehicleId: 'EV-001' },
      { date, type: 'delivery',   startTime: '16:00', endTime: '18:00', village: DEMO_VILLAGE, district: DEMO_DISTRICT, evVehicleId: 'EV-001' }
    );
  }
  await Slot.insertMany(slots);
  console.log(`\n🚗 Created ${slots.length} EV slots for ${DEMO_VILLAGE} (next 7 days)`);


  const assessment = await Assessment.create({
    patient: patient._id,
    conductedBy: whf._id,
    status: 'completed',
    completedAt: new Date(),
    qa: [
      { questionId: 'q1', question: 'What is your main health concern today?', answer: 'Feeling very dizzy and tired for the past 3 days', category: 'symptom', answeredAt: new Date() },
      { questionId: 'q2', question: 'How long have you been experiencing this?', answer: '3 days', category: 'duration', answeredAt: new Date() },
      { questionId: 'q3', question: 'On a scale of 1–10, how severe is it?', answer: '7', category: 'severity', answeredAt: new Date() },
      { questionId: 'q4', question: 'Do you have any fever or headache?', answer: 'Mild headache, no fever', category: 'symptom', answeredAt: new Date() },
      { questionId: 'q5', question: 'Are you currently pregnant?', answer: 'No', category: 'history', answeredAt: new Date() },
      { questionId: 'q6', question: 'Do you have diabetes or BP issues?', answer: 'No known conditions', category: 'history', answeredAt: new Date() },
    ],
    vitalsSnapshot: {
      bp: '110/70',
      hemoglobin: 9.2,
      bloodSugar: 88,
      weight: 52,
    },
    report: {
      symptomsSummary: 'Patient reports persistent dizziness and fatigue for 3 days with mild headache. No fever.',
      duration: '3 days',
      severity: 'moderate',
      keyObservations: [
        'Hemoglobin 9.2 g/dL — below normal threshold (anemia risk)',
        'BP 110/70 — slightly low',
        'Severity rated 7/10 by patient',
        'No pregnancy, no known chronic conditions',
      ],
      possibleConcerns: [
        'Iron deficiency anemia',
        'Nutritional deficiency',
      ],
      urgencyLevel: 'priority',
      recommendedTests: ['CBC - Complete Blood Count', 'Serum Ferritin'],
      generatedAt: new Date(),
    },
  });

  console.log(`\n📋 Created demo assessment for ${patient.name}`);
  console.log(`   Assessment ID: ${assessment._id}`);
  console.log(`   Urgency: priority | Symptoms: dizziness + fatigue`);

  console.log('\n✅ Seeding complete!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('DEMO CREDENTIALS (all use OTP: 1234)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Patient  → 9000000001');
  console.log('WHF      → 9000000002');
  console.log('Doctor   → 9000000003');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  mongoose.connection.close();
};

seed().catch(err => {
  console.error('Seeder error:', err);
  process.exit(1);
});