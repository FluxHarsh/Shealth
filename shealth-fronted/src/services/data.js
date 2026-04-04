


export const AI_ENDPOINT =
  import.meta.env.VITE_AI_URL || 'https://tic-invictus-1.onrender.com/assessment/start';

export const QUESTIONS = [
  { id: 1, q: 'What is your main concern today?',
    type: 'multi',
    opts: ['Pain or discomfort', 'Fever or weakness', 'Pregnancy related',
           'Mental health', 'Menstrual issues', 'Other'] },
  { id: 2, q: 'How long have you had this symptom?',
    type: 'single',
    opts: ['1–2 days', '3–5 days', '1 week', 'More than a week'] },
  { id: 3, q: 'How severe is the discomfort?',
    type: 'single',
    opts: ['Mild – I can manage', 'Moderate – it\'s bothering me',
           'Severe – very painful', 'Unbearable – need help now'] },
  { id: 4, q: 'Any additional symptoms?',
    type: 'multi',
    opts: ['Fever', 'Nausea / Vomiting', 'Headache', 'Fatigue', 'Dizziness', 'None'] },
  { id: 5, q: 'Are you pregnant or breastfeeding?',
    type: 'single',
    opts: ['Yes, pregnant', 'Yes, breastfeeding', 'No', 'Not sure'] },
  { id: 6, q: 'Any known medical conditions?',
    type: 'multi',
    opts: ['Diabetes', 'High blood pressure', 'Anemia', 'Thyroid', 'None', 'Other'] },
  { id: 7, q: 'Are you currently taking any medicines?',
    type: 'single',
    opts: ['Yes, regularly', 'Yes, sometimes', 'No', 'I don\'t know'] },
  { id: 8, q: 'How would you describe your diet recently?',
    type: 'single',
    opts: ['Eating well', 'Eating less than usual', 'Skipping meals', 'Not eating at all'] },
];


export async function generateReport(answers) {
  const payload = {
    answers: answers.map((ans, i) => ({
      question: QUESTIONS[i]?.q || `Q${i + 1}`,
      answer:   Array.isArray(ans) ? ans : [ans],
    })),
  };
  try {
    const res = await fetch(AI_ENDPOINT, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
      signal:  AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('AI API not ready — using mock report:', err.message);
    return MOCK_REPORT;
  }
}


const MOCK_REPORT = {
  symptoms:         ['Fatigue', 'Headache (Intermittent)', 'Nausea', 'Joint Pain'],
  duration:         'Last 3 Days',
  severity:         'Moderate',
  severityScore:    5,
  keyObservations:  [
    'Symptoms suggest a viral illness.',
    'Hydration and rest are recommended.',
    'If symptoms persist beyond 5 days, consult a doctor.',
    'Consider dietary adjustments for better recovery.',
  ],
  riskFlags:        null,
  riskLevel:        'low',
  recommendedTests: [],
  summary:          'Patient presents with moderate symptoms for 3 days. Recommend supportive care.',
};


export const MOCK = {
  patient: { name: 'Priya', age: 28, village: 'Chandanpur', ovulationDaysLeft: 2 },

  whf: {
    name: 'Sunita',
    vitalsRecorded:   5,
    sessionsAssisted: 2,
    earnings:         340,
    tasks: [
      { id: 1, type: 'vitals',     patient: 'Priya Sharma',  status: 'urgent',  progress: 0  },
      { id: 2, type: 'ai_session', patient: 'Anjali Patel',  status: 'pending', progress: 60 },
      { id: 3, type: 'sample',     patient: 'Sangeeta Devi', status: 'new',     progress: 30 },
      { id: 4, type: 'camp',       patient: 'Village awareness drive', status: 'new', progress: 0 },
    ],
  },

  doctor: {
    name:      'Meera Sharma',
    specialty: 'Gynecologist & Obstetrician',
    queue: [
      { id: 1, name: 'Suman Devi',   age: 28, village: 'Chandanpur', symptoms: 'Severe abdominal pain, bleeding',   urgency: 'urgent',   wait: '5 min'  },
      { id: 2, name: 'Anita Kumari', age: 35, village: 'Rampur',     symptoms: 'Pregnancy check-up, dizziness',    urgency: 'priority', wait: '18 min' },
      { id: 3, name: 'Priya Singh',  age: 22, village: 'Bholapur',   symptoms: 'General consultation, follow-up',  urgency: 'routine',  wait: '32 min' },
      { id: 4, name: 'Laxmi Verma',  age: 41, village: 'Sundarpur',  symptoms: 'Menopause symptoms, consultation', urgency: 'routine',  wait: '45 min' },
    ],
    aiReport: {
      patient: 'Anita Sharma', age: 34, village: 'Chandanpur',
      symptoms: ['Fatigue', 'Headaches', 'Joint Pain', 'Dizziness'],
      severity: 'Moderate', duration: '3 Weeks',
      keyObservations: [
        'Iron deficiency anemia indicators',
        'Potential vitamin D deficiency',
        'Stress-related symptoms detected',
        'Consistent low-grade fever reported',
      ],
      riskFlags:  'High Risk: Potential underlying infection — immediate attention required.',
      riskLevel:  'high',
    },
  },

  labResults: {
    status:   'Normal',
    date:     'October 24, 2023',
    testName: 'Annual Wellness Panel – Blood & Urine',
    hemoglobin:  { value: 13.2, unit: 'g/dL',  min: 12,  max: 15.5 },
    bloodSugar:  { value: 92,   unit: 'mg/dL', min: 70,  max: 99   },
    systolic:    { value: 118,  unit: 'mmHg',  min: 90,  max: 120  },
    diastolic:   { value: 78,   unit: 'mmHg',  min: 60,  max: 80   },
  },
};
