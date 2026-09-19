const mongoose = require("mongoose");
const { allowedCategories } = require("../utils/emissionCategories");

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    imageUrl: String,
    price: Number,
    category: {
        type: String,
        enum: allowedCategories,
        required: true
    },
    condition: String,
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    status: {
        type: String,
        enum: ["Available", "Reserved", "Sold"],
        default: "Available"
    },

    co2Saved: Number,

    location: {
        type: { type: String, enum: ["Point"] },
        coordinates: { type: [Number] }  // [lng, lat]
    },
    locationName: { type: String }  // e.g. "Matara"

}, { timestamps: true });

productSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Product", productSchema);
