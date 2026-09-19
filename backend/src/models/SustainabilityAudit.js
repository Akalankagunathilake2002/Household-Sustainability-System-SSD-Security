const mongoose = require('mongoose');

const SustainabilityAuditSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    environmental: {
        electricityUsage: {
            type: Number,
            required: true,
            min: 0
        },
        solarPanels: {
            type: Boolean,
            required: true
        },
        waterSavingTaps: {
            type: Boolean,
            required: true
        },
        wasteSeparation: {
            type: Boolean,
            required: true
        },
        waterUsage: {
            type: Number,
            required: true,
            min: 0
        }
    },
    social: {
        communityParticipation: {
            type: Boolean,
            required: true
        },
        safeNeighborhood: {
            type: Boolean,
            required: true
        },
        publicTransportUsage: {
            type: Boolean,
            required: true
        }
    },
    economic: {
        energyEfficientAppliances: {
            type: Boolean,
            required: true
        },
        budgetTracking: {
            type: Boolean,
            required: true
        },
        sustainableShopping: {
            type: Boolean,
            required: true
        }
    },
    score: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    environmentalScore: {
        type: Number,
        default: 0
    },
    overallSustainabilityPercentage: {
        type: Number,
        default: 0
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('SustainabilityAudit', SustainabilityAuditSchema);
