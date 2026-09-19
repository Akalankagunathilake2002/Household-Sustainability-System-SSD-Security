const mongoose = require('mongoose');

const ScoringConfigSchema = new mongoose.Schema({
    environmental: {
        electricityUsageThreshold1: { type: Number, default: 150 },
        electricityUsagePoints1: { type: Number, default: 10 },
        electricityUsageThreshold2: { type: Number, default: 300 },
        electricityUsagePoints2: { type: Number, default: 5 },
        waterUsageThreshold1: { type: Number, default: 100 },
        waterUsagePoints1: { type: Number, default: 10 },
        waterUsageThreshold2: { type: Number, default: 200 },
        waterUsagePoints2: { type: Number, default: 5 },
        solarPanelsPoints: { type: Number, default: 10 },
        waterSavingTapsPoints: { type: Number, default: 10 },
        wasteSeparationPoints: { type: Number, default: 10 }
    },
    social: {
        communityParticipationPoints: { type: Number, default: 10 },
        safeNeighborhoodPoints: { type: Number, default: 10 },
        publicTransportUsagePoints: { type: Number, default: 10 }
    },
    economic: {
        energyEfficientAppliancesPoints: { type: Number, default: 10 },
        budgetTrackingPoints: { type: Number, default: 10 },
        sustainableShoppingPoints: { type: Number, default: 10 }
    },
    wastePickupPoints: {
        type: Number,
        default: 10
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ScoringConfig', ScoringConfigSchema);
