const User = require('../models/User');
const ScoringConfig = require('../models/ScoringConfig');
const SustainabilityAudit = require('../models/SustainabilityAudit');

// Helper function to calculate score
const calculateScore = (data, config) => {
    let environmentalPoints = 0;
    let socialPoints = 0;
    let economicPoints = 0;

    const envConfig = config.environmental;
    const socConfig = config.social;
    const ecoConfig = config.economic;

    // Environmental
    // Electricity Usage
    if (data.environmental.electricityUsage < envConfig.electricityUsageThreshold1) environmentalPoints += envConfig.electricityUsagePoints1;
    else if (data.environmental.electricityUsage < envConfig.electricityUsageThreshold2) environmentalPoints += envConfig.electricityUsagePoints2;

    // Water Usage
    if (data.environmental.waterUsage < envConfig.waterUsageThreshold1) environmentalPoints += envConfig.waterUsagePoints1;
    else if (data.environmental.waterUsage < envConfig.waterUsageThreshold2) environmentalPoints += envConfig.waterUsagePoints2;

    // Boolean questions
    if (data.environmental.solarPanels) environmentalPoints += envConfig.solarPanelsPoints;
    if (data.environmental.waterSavingTaps) environmentalPoints += envConfig.waterSavingTapsPoints;
    if (data.environmental.wasteSeparation) environmentalPoints += envConfig.wasteSeparationPoints;

    // Social
    if (data.social.communityParticipation) socialPoints += socConfig.communityParticipationPoints;
    if (data.social.safeNeighborhood) socialPoints += socConfig.safeNeighborhoodPoints;
    if (data.social.publicTransportUsage) socialPoints += socConfig.publicTransportUsagePoints;

    // Economic
    if (data.economic.energyEfficientAppliances) economicPoints += ecoConfig.energyEfficientAppliancesPoints;
    if (data.economic.budgetTracking) economicPoints += ecoConfig.budgetTrackingPoints;
    if (data.economic.sustainableShopping) economicPoints += ecoConfig.sustainableShoppingPoints;

    const totalPoints = environmentalPoints + socialPoints + economicPoints;

    // Calculate max possible points based on config
    const maxEnvPoints = envConfig.electricityUsagePoints1 + envConfig.waterUsagePoints1 +
        envConfig.solarPanelsPoints + envConfig.waterSavingTapsPoints + envConfig.wasteSeparationPoints;
    const maxSocPoints = socConfig.communityParticipationPoints + socConfig.safeNeighborhoodPoints + socConfig.publicTransportUsagePoints;
    const maxEcoPoints = ecoConfig.energyEfficientAppliancesPoints + ecoConfig.budgetTrackingPoints + ecoConfig.sustainableShoppingPoints;

    const maxPoints = maxEnvPoints + maxSocPoints + maxEcoPoints;

    const environmentalScore = maxEnvPoints > 0 ? (environmentalPoints / maxEnvPoints) * 100 : 0;
    const overallSustainabilityPercentage = maxPoints > 0 ? (totalPoints / maxPoints) * 100 : 0;

    return {
        score: Math.min(totalPoints, 100),
        environmentalScore: Math.round(environmentalScore * 100) / 100,
        overallSustainabilityPercentage: Math.round(overallSustainabilityPercentage * 100) / 100
    };
};

exports.createAudit = async (req, res) => {
    try {
        const { environmental, social, economic } = req.body;

        if (!environmental || !social || !economic) {
            return res.status(400).json({ msg: 'Please provide environmental, social, and economic data' });
        }

        let config = await ScoringConfig.findOne();
        if (!config) {
            config = new ScoringConfig();
            await config.save();
        }

        const scores = calculateScore({ environmental, social, economic }, config);

        const newAudit = new SustainabilityAudit({
            user: req.user.id,
            environmental,
            social,
            economic,
            score: scores.score,
            environmentalScore: scores.environmentalScore,
            overallSustainabilityPercentage: scores.overallSustainabilityPercentage
        });

        const audit = await newAudit.save();

        // Update User's sustainability score
        await User.findByIdAndUpdate(req.user.id, { sustainabilityScore: scores.overallSustainabilityPercentage });

        res.json(audit);
    } catch (err) {
        console.error("Audit Creation Error:", err.message);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ msg: err.message, errors: err.errors });
        }
        res.status(500).send('Server Error: ' + err.message);
    }
};

exports.getAudit = async (req, res) => {
    try {
        const audits = await SustainabilityAudit.find({ user: req.user.id }).sort({ date: -1 });

        if (!audits) {
            return res.status(404).json({ msg: 'No audits found for this user' });
        }

        res.json(audits);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getAllAudits = async (req, res) => {
    try {
        const audits = await SustainabilityAudit.find().populate('user', ['username', 'email']);
        res.json(audits);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.updateAudit = async (req, res) => {
    try {
        const { environmental, social, economic } = req.body;
        let audit = await SustainabilityAudit.findById(req.params.id);

        if (!audit) {
            return res.status(404).json({ msg: 'Audit not found' });
        }

        // Make sure user owns audit
        if (audit.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        if (!environmental || !social || !economic) {
            return res.status(400).json({ msg: 'Please provide environmental, social, and economic data for update' });
        }

        let config = await ScoringConfig.findOne();
        if (!config) {
            config = new ScoringConfig();
            await config.save();
        }

        const scores = calculateScore({ environmental, social, economic }, config);

        audit = await SustainabilityAudit.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    environmental,
                    social,
                    economic,
                    score: scores.score,
                    environmentalScore: scores.environmentalScore,
                    overallSustainabilityPercentage: scores.overallSustainabilityPercentage
                }
            },
            { new: true, runValidators: true }
        );

        // Update User's sustainability score
        await User.findByIdAndUpdate(req.user.id, { sustainabilityScore: scores.overallSustainabilityPercentage });

        res.json(audit);
    } catch (err) {
        console.error("Audit Update Error:", err.message);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ msg: err.message, errors: err.errors });
        }
        res.status(500).send('Server Error: ' + err.message);
    }
};

exports.deleteAudit = async (req, res) => {
    try {
        let audit = await SustainabilityAudit.findById(req.params.id);

        if (!audit) {
            return res.status(404).json({ msg: 'Audit not found' });
        }

        // Make sure user owns audit
        if (audit.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        await SustainabilityAudit.findByIdAndDelete(req.params.id);

        res.json({ msg: 'Audit removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
