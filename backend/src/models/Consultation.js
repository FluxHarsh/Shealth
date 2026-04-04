const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    name: String,
    dosage: String,      
    frequency: String,    
    duration: String,     
    instructions: String, 
  },
  { _id: false }
);

const consultationSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },


    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment',
      required: true,
    },

    jitsiRoomName: { type: String, unique: true },

    status: {
      type: String,
      enum: ['scheduled', 'ongoing', 'completed', 'cancelled', 'no_show'],
      default: 'scheduled',
    },

    scheduledAt: { type: Date, required: true },
    startedAt: Date,
    endedAt: Date,
    durationMinutes: Number,  

    doctorNotes: {
      diagnosis: String,
      prescription: [medicineSchema],
      testsOrdered: [String],             
      followUpDate: Date,
      followUpNotes: String,
      referral: {                         
        needed: { type: Boolean, default: false },
        specialistType: String,
        urgency: String,
      },
    },

    patientFeedback: {
      rating: { type: Number, min: 1, max: 5 },
      comment: String,
      submittedAt: Date,
    },

    whfPresent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
consultationSchema.index({ patient: 1, scheduledAt: -1 });
consultationSchema.index({ doctor: 1, status: 1 });
consultationSchema.index({ status: 1, scheduledAt: 1 }); // For doctor's queue view

module.exports = mongoose.model('Consultation', consultationSchema);
