const router = require('express').Router();
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const User = require('../models/User');


router.use(protect);


router.get('/profile', async (req, res) => {
  res.json({ success: true, user: req.user });
});


router.patch(
  '/profile',
  [
    body('name').optional().isLength({ min: 2 }).withMessage('Name too short'),
    body('age').optional().isInt({ min: 1, max: 120 }).withMessage('Invalid age'),
    body('village').optional().isLength({ min: 2 }).withMessage('Village name too short'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const allowed = ['name', 'age', 'village', 'district', 'language'];
      const updates = {};
      allowed.forEach(field => {
        if (req.body[field] !== undefined) updates[field] = req.body[field];
      });

      const user = await User.findByIdAndUpdate(req.user._id, updates, {
        new: true,
        runValidators: true,
      });

      res.json({ success: true, user });
    } catch (err) {
      next(err);
    }
  }
);


router.get('/:id', authorize('doctor', 'whf'), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;