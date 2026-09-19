const ScoringConfig = require('../models/ScoringConfig');

// Get Scoring Config
exports.getScoringConfig = async (req, res) => {
    try {
        let config = await ScoringConfig.findOne();
        if (!config) {
            config = new ScoringConfig();
            await config.save();
        }
        res.json(config);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Update Scoring Config
exports.updateScoringConfig = async (req, res) => {
    try {
        const { environmental, social, economic, wastePickupPoints } = req.body;

        let config = await ScoringConfig.findOne();
        if (!config) {
            config = new ScoringConfig();
        }

        if (environmental) config.environmental = { ...config.environmental, ...environmental };
        if (social) config.social = { ...config.social, ...social };
        if (economic) config.economic = { ...config.economic, ...economic };
        if (typeof wastePickupPoints !== 'undefined') config.wastePickupPoints = wastePickupPoints;

        config.updatedAt = Date.now();
        await config.save();

        res.json(config);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
