require("dotenv").config();
const axios = require("axios");
const { emissionCategories } = require("../utils/emissionCategories");
const { manualCarbonFallback } = require("../utils/manualCarbonFallback");

async function calculateCarbon(category) {
  try {
    const item = emissionCategories[category];
    if (!item) return null;

    if (item.useFallback) {
      console.log("Using manual fallback for category:", category);
      return manualCarbonFallback[category] || 5;
    }

    const response = await axios.post(
      "https://api.climatiq.io/data/v1/estimate",
      {
        emission_factor: {
          activity_id: item.activityId,
          data_version: "^21"
        },
        parameters: {
          weight: item.weight,
          weight_unit: "kg"
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CLIMATIQ_API_KEY}`
        }
      }
    );

    return Math.round(response.data.co2e);

  } catch (error) {
    console.error("Carbon API error, using fallback:", error.response?.data || error.message);

    // Fallback calculation
    return manualCarbonFallback[category] || 5;
  }
}

module.exports = { calculateCarbon };