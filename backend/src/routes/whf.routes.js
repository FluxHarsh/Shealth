const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');

const { getDashboard, getVillagePatients, getEarnings, getPendingCollections } = require('../controllers/whf.controller');

 
router.use(protect);
router.use(authorize('whf')); 
 
router.get('/dashboard', getDashboard);
router.get('/patients', getVillagePatients);
router.get('/earnings', getEarnings);
router.get('/pending-collections', getPendingCollections);
 
module.exports = router ;
