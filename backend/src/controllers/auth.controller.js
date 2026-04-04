const User = require('../models/User');
const { sendOTP } = require('../utils/otp');   
const { generateToken } = require('../utils/jwt');


const otpStore = new Map();


const sendOtp = async (req, res, next) => {
  try {
    const { phone, name, role = 'patient', village, district } = req.body;


    let user = await User.findOne({ phone });
    const isNewUser = !user;

    if (!user) {

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Name is required for new registration.',
        });
      }
      user = await User.create({ phone, name, role, village, district });
    }


    const otp = await sendOTP(phone);


    otpStore.set(phone, otp);

    res.json({
      success: true,
      message: `OTP sent to ${phone}.`,
      isNewUser,
    });
  } catch (err) {
    next(err);
  }
};


const verifyOtp = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;


    const storedOtp = otpStore.get(phone);

    if (!storedOtp) {
      return res.status(401).json({
        success: false,
        message: 'OTP not found. Please request a new one.',
      });
    }

    if (storedOtp !== otp) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect OTP.',
      });
    }


    otpStore.delete(phone);

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }


    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        village: user.village,
        district: user.district,
        language: user.language,
      },
    });
  } catch (err) {
    next(err);
  }
};


const loginWithPassword = async (req, res, next) => {
  try {
    const { phone, password } = req.body;


    const user = await User.findOne({ phone, role: { $in: ['whf', 'doctor'] } })
      .select('+passwordHash');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};


const getMe = async (req, res) => {
  res.json({
    success: true,
    user: req.user, 
  });
};

module.exports = { sendOtp, verifyOtp, loginWithPassword, getMe };
