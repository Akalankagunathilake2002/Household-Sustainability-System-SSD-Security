const mongoose = require('mongoose');
const Roles = require('../utils/roles');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: Object.values(Roles),
        default: Roles.USER
    },
    date: {
        type: Date,
        default: Date.now
    },
    sustainabilityScore: {
        type: Number,
        default: 0
    },
    wasteScore: {
        type: Number,
        default: 0
    },
    otp: {
        type: String
    },
    otpExpires: {
        type: Date
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    mobileNumber: {
        type: String
    }
});

module.exports = mongoose.model('User', UserSchema);
