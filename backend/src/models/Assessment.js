
const mongoose = require('mongoose');


const qaSchema = new mongoose.Schema(
  {
    questionId: String,           
    question: { type: String, required: true },
    answer: { type: String },     
    answeredAt: { type: Date },

    category: {
      type: String,
      enum: ['symptom', 'duration', 'severity', 'history', 'lifestyle', 'mental_health'],
    },
  },
  { _id: false } 
);


const reportSchema = new mongoose.Schema(
  {
    symptomsSummary: String,      
    duration: String,              
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe'],
    },
    keyObservations: [String],     
    possibleConcerns: [String],    
    urgencyLevel: {
      type: String,
      enum: ['routine', 'priority', 'urgent'],
      default: 'routine',
    },
    recommendedTests: [String],    
    generatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const assessmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },


    conductedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', 
      default: null,
    },

    status: {
      type: String,
      enum: ['in_progress', 'completed', 'abandoned'],
      default: 'in_progress',
    },


    qa: [qaSchema],


    report: reportSchema,


    vitalsSnapshot: {
      bp: String,             
      hemoglobin: Number,     
      bloodSugar: Number,     
      weight: Number,        
      recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },


    consultation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Consultation',
      default: null,
    },


    imageAnalysis: {
      imageType:           String,   
      visualObservations:  [String],
      possibleIndicators:  [String],
      urgencyFlag:         String,  
      additionalContext:   String,
      recommendedQuestions:[String],
    },

    completedAt: Date,
  },
  {
    timestamps: true,
  }
);


assessmentSchema.index({ patient: 1, createdAt: -1 });
assessmentSchema.index({ status: 1 });

module.exports = mongoose.model('Assessment', assessmentSchema);
