const mongoose = require("mongoose");

const DisasterSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: [
        "Flood",
        "Fire",
        "Earthquake",
        "Landslide",
        "Storm",
        "Drought",
        "Tsunami",
        "Other",
      ],
    },
    description: { type: String, default: "" },

    // Simple location fields (easy for CRUD)
    locationName: { type: String, required: true }, 
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },

    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "low",
    },

    status: {
      type: String,
      enum: ["active", "monitoring", "resolved"],
      default: "active",
    },

    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // For future NASA integration (track external source)
    source: { type: String, enum: ["manual", "nasa"], default: "manual" },
    externalId: { type: String, default: null }, // NASA event id (if any)
  },
  { timestamps: true }
);

module.exports = mongoose.model("Disaster", DisasterSchema);
