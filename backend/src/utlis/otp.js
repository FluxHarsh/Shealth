const OTP = require('../models/OTP');

const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

/**
 * Send OTP to a phone number and save it to DB
 * @param {string} phone - 10-digit Indian mobile number
 * @returns {Promise<string>} - The OTP (for mock mode logging)
 */

const sendOTP = async (phone) => {

  await OTP.deleteMany({ phone });

  const otp = process.env.USE_MOCK_OTP === 'true'
    ? (process.env.MOCK_OTP || '1234')
    : generateOTP();


  await OTP.create({ phone, otp });

  if (process.env.USE_MOCK_OTP === 'true') {

    console.log(`\n [MOCK OTP] Phone: ${phone} | OTP: ${otp}\n`);
    return otp;
  }


  return otp;
};

/**
 * Verify OTP from DB
 * @returns {{ valid: boolean, reason?: string }}
 */
const verifyOTP = async (phone, inputOtp) => {
  const record = await OTP.findOne({ phone });

  if (!record) {
    return { valid: false, reason: 'OTP not found or expired. Please request a new one.' };
  }

  record.attempts += 1;
  await record.save();

  if (record.attempts > 5) {
    await OTP.deleteOne({ phone });
    return { valid: false, reason: 'Too many incorrect attempts. Please request a new OTP.' };
  }

  if (record.otp !== inputOtp) {
    return { valid: false, reason: 'Incorrect OTP.' };
  }

  await OTP.deleteOne({ phone });
  return { valid: true };
};

module.exports = { sendOTP, verifyOTP };
