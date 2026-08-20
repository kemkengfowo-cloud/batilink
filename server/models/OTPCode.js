const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  contact: { type: String, required: true },
  code: { type: String, required: true },
  type: { type: String, enum: ['email', 'sms'], required: true },
  expires: { type: Date, required: true },
  verified: { type: Boolean, default: false }
}, { timestamps: true });

otpSchema.index({ expires: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OTPCode', otpSchema);
