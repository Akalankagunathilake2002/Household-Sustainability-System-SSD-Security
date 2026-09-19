const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
    isRegistrationOtpEnabled: {
        type: Boolean,
        default: true
    },
    isRoleSelectionEnabled: {
        type: Boolean,
        default: false
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Settings', SettingsSchema);
