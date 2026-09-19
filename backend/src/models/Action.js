const mongoose = require("mongoose");

const ActionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },

    category: {
      type: String,
      enum: [
        "Waste Reduction",
        "Energy Efficiency",
        "Water Conservation",
        "Sustainable DIY",
        "Eco Shopping",
        "Community Action",
      ],
      required: true,
    },

    images: [String],

    likes: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],

    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        text: String,
        date: { type: Date, default: Date.now },
      },
    ],

    reports: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        reason: String,
        date: { type: Date, default: Date.now },
      },
    ],

    isFlagged: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Action", ActionSchema);

