const Settings = require('../models/Settings');

// Get Settings
exports.getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings();
            await settings.save();
        }
        res.json(settings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Update Settings
exports.updateSettings = async (req, res) => {
    try {
        const { isRegistrationOtpEnabled, isRoleSelectionEnabled } = req.body;

        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings();
        }

        if (typeof isRegistrationOtpEnabled !== 'undefined') {
            settings.isRegistrationOtpEnabled = isRegistrationOtpEnabled;
        }

        if (typeof isRoleSelectionEnabled !== 'undefined') {
            settings.isRoleSelectionEnabled = isRoleSelectionEnabled;
        }

        settings.updatedAt = Date.now();
        await settings.save();

        res.json(settings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
