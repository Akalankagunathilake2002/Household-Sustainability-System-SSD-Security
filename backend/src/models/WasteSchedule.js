const mongoose = require('mongoose');

const WasteScheduleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    date: {
        type: Date,
        required: true
    },
    type: {
        type: String,
        enum: ['General', 'Recyclable', 'Organic', 'Hazardous', 'E-Waste', 'Other'],
        default: 'General'
    },
    area: {
        type: String,
        required: true,
        trim: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('WasteSchedule', WasteScheduleSchema);
