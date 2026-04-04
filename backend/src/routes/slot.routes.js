// routes/slot.routes.js — Mounted at /api/slots
const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');

const { generateSlots, getAvailableSlots, bookSlot } = require('../controllers/slot.controller');
 
router.use(protect);
 
router.post('/generate', authorize('doctor', 'whf'), generateSlots);
router.get('/available', getAvailableSlots);
router.post('/:id/book', bookSlot);
 
module.exports =  router ;