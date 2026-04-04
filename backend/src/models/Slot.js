const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },

    type: {
      type: String,
      enum: ['collection', 'delivery'], 
      required: true,
    },

    startTime: { type: String, required: true }, 
    endTime: { type: String, required: true },   

    village: { type: String, required: true },
    district: { type: String },

    evVehicleId: String,
    driverName: String,

    bookings: [
      {
        patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        diagnostic: { type: mongoose.Schema.Types.ObjectId, ref: 'Diagnostic' },
        address: String,
        status: {
          type: String,
          enum: ['booked', 'collected', 'skipped'],
          default: 'booked',
        },
        bookedAt: { type: Date, default: Date.now },
      },
    ],

    maxCapacity: { type: Number, default: 10 },

    status: {
      type: String,
      enum: ['open', 'full', 'completed', 'cancelled'],
      default: 'open',
    },
  },
  {
    timestamps: true,
  }
);


slotSchema.virtual('availableSpots').get(function () {
  return this.maxCapacity - this.bookings.length;
});


slotSchema.index({ village: 1, date: 1, type: 1, status: 1 });

module.exports = mongoose.model('Slot', slotSchema);