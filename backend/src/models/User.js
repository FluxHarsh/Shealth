const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      match: [/^[6-9]\d{9}$/, 'Please enter a valid Indian mobile number'],
    },

    role: {
      type: String,
      enum: {
        values: ['patient', 'whf', 'doctor'],
        message: 'Role must be patient, whf, or doctor',
      },
      required: true,
    },

    language: {
      type: String,
      enum: ['en', 'hi'],
      default: 'en',
    },

    village: { type: String, trim: true },
    district: { type: String, trim: true },
    state: { type: String, trim: true, default: 'Madhya Pradesh' },

    // Optional password for WHF and Doctor (patients use OTP only)
    passwordHash: { type: String, select: false }, 

    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },

    // For patients
    age: { type: Number, min: 1, max: 120 },
    gender: { type: String, enum: ['female', 'male', 'other'], default: 'female' },
  },
  {
    timestamps: true, 
  }
);


// Called as: user.comparePassword('plaintext')
// Returns true/false
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(candidatePassword, this.passwordHash);
};


// Runs automatically whenever we call user.save()
// Only rehashes if the password field was actually changed
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12); 
  next();
});



module.exports = mongoose.model('User', userSchema);