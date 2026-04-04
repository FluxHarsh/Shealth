const Slot = require('../models/Slot');

// POST /api/slots/generate 
const generateSlots = async (req, res, next) => {
  try {
    const { village, district, days = 7, evVehicleId } = req.body;

    const slotsToCreate = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i + 1); 
      date.setHours(0, 0, 0, 0);


      slotsToCreate.push({
        date, village, district,
        type: 'collection',
        startTime: '07:00', endTime: '09:00',
        evVehicleId,
      });


      slotsToCreate.push({
        date, village, district,
        type: 'delivery',
        startTime: '16:00', endTime: '18:00',
        evVehicleId,
      });
    }

    const slots = await Slot.insertMany(slotsToCreate);

    res.status(201).json({
      success: true,
      message: `Created ${slots.length} slots for ${village} over ${days} days.`,
      slots,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/slots/available 
const getAvailableSlots = async (req, res, next) => {
  try {
    const { village, type, date } = req.query;

    const filter = { village, status: 'open' };
    if (type) filter.type = type;
    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const dEnd = new Date(date);
      dEnd.setHours(23, 59, 59, 999);
      filter.date = { $gte: d, $lte: dEnd };
    } else {
      filter.date = { $gte: new Date() };
    }

    const slots = await Slot.find(filter).sort({ date: 1 }).limit(10);

    res.json({
      success: true,
      slots: slots.map(s => ({
        id: s._id,
        date: s.date,
        type: s.type,
        startTime: s.startTime,
        endTime: s.endTime,
        availableSpots: s.maxCapacity - s.bookings.length,
      })),
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/slots/:id/book 
const bookSlot = async (req, res, next) => {
  try {
    const { patientId, diagnosticId, address } = req.body;
    const slot = await Slot.findById(req.params.id);

    if (!slot) return res.status(404).json({ success: false, message: 'Slot not found.' });
    if (slot.status === 'full') return res.status(400).json({ success: false, message: 'Slot is full.' });

    slot.bookings.push({ patient: patientId, diagnostic: diagnosticId, address });
    if (slot.bookings.length >= slot.maxCapacity) slot.status = 'full';

    await slot.save();
    res.json({ success: true, message: 'Slot booked.', slot });
  } catch (err) {
    next(err);
  }
};

module.exports = { generateSlots, getAvailableSlots, bookSlot };