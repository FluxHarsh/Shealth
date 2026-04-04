const mongoose = require('mongoose');

const diagnosticSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    orderedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    consultation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Consultation',
    },


    testsOrdered: [
      {
        name: String,         
        code: String,         
        priority: {
          type: String,
          enum: ['routine', 'urgent'],
          default: 'routine',
        },
      },
    ],

    status: {
      type: String,
      enum: ['ordered', 'sample_collected', 'at_lab', 'result_ready', 'reviewed'],
      default: 'ordered',
    },

    sampleCollection: {
      slot: { type: mongoose.Schema.Types.ObjectId, ref: 'Slot' },
      collectedAt: Date,
      collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // WHF
      evVehicleId: String,
    },

    result: {
      reportUrl: String,          
      reportData: mongoose.Schema.Types.Mixed, 
      uploadedAt: Date,
      labName: String,
      labTechnicianName: String,
    },


    doctorReview: {
      notes: String,
      reviewedAt: Date,
      actionTaken: String,       
    },

    expectedResultBy: Date,      
  },
  {
    timestamps: true,
  }
);

diagnosticSchema.index({ patient: 1, status: 1 });
diagnosticSchema.index({ status: 1, createdAt: 1 }); 

module.exports = mongoose.model('Diagnostic', diagnosticSchema);
