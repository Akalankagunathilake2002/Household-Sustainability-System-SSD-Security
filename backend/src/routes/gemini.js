const express = require("express");
const axios = require("axios");

const router = express.Router();

router.post("/generate", async (req, res) => {
  try {
    // ------ Validate Input ------
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({
        status: "Error",
        message: "Text prompt is required"
      });
    }

    // ------ Sustainability-focused prompt ------
    const sustainabilityPrompt = `
You are a sustainability expert.
Based on the following household situation, give practical and realistic recommendations
to improve household sustainability practices.

Focus on:
- Energy efficiency
- Water conservation
- Waste management
- Eco-friendly lifestyle habits

Household details:
${text}
`;

    // ------ Gemini API Call ------
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: sustainabilityPrompt }]
          }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    // ------ Extract AI Response ------
    const reply =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return res.json({
      status: "Success",
      recommendations: reply
    });

  } catch (error) {
    console.error("FULL ERROR:", error.response?.data || error.message);

    return res.status(500).json({
      status: "Error",
      message: error.response?.data || error.message
    });
  }
});

module.exports = router;
