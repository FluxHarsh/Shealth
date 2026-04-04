const mongoose = require('mongoose');

const vitalsSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    //  Measurements 
    bloodPressure: {
      systolic: Number,   
      diastolic: Number,  

    },

    hemoglobin: Number,   

    bloodSugar: {
      value: Number,    
      type: {
        type: String,
        enum: ['fasting', 'post_meal', 'random'],
        default: 'random',
      },
    },

    weight: Number,       
    height: Number,       
    bmi: Number,         

    temperature: Number,  
    oxygenSaturation: Number,
    pulseRate: Number,    

    recordedAt: {
      type: String,
      enum: ['hub', 'home', 'camp'],
      default: 'hub',
    },

    notes: { type: String, maxlength: 500 },

    alerts: [
      {
        type: String,
        enum: [
          'high_bp', 'low_bp',
          'anemia_risk',          
          'high_sugar', 'low_sugar',
          'low_oxygen',
          'fever',
        ],
      },
    ],

    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index: get all vitals for a patient in chronological order
vitalsSchema.index({ patient: 1, createdAt: -1 });

module.exports = mongoose.model('Vitals', vitalsSchema);