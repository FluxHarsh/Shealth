const jwt = require('jsonwebtoken');

/**
 * @param {Object} user - Mongoose User document
 * @returns {string} signed JWT token
 */

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      phone: user.phone,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

module.exports = { generateToken };
