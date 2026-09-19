const mongoose = require("mongoose");

const ArticleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },

    category: {
      type: String,
      enum: [
        "Waste Reduction",
        "Energy Efficiency",
        "Water Conservation",
        "Sustainable DIY",
        "Eco Shopping",
      ],
      required: true,
    },

    image: String,

    isPublished: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Article", ArticleSchema);

