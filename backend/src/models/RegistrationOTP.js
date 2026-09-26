const mongoose = require('mongoose');

const RegistrationOTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    otp: {
        type: String,
        required: false
    },
    otpHash: {
        type: String,
        required: false
    },
    attempts: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600 // 10 minutes
    }
});

module.exports = mongoose.model('RegistrationOTP', RegistrationOTPSchema);

