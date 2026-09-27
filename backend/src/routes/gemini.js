const express = require("express");
const axios = require("axios");
const rateLimit = require("express-rate-limit");
const logger = require("../utils/logger");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Fix (Vuln #13 - CWE-770 Allocation of Resources Without Limits):
// Cap how often a caller may spend the paid Gemini API quota.
const geminiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,                  // 20 requests per window per caller
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "Error",
    message: "Too many requests. Please try again later."
  }
});

// Fix (Vuln #13 - CWE-770): cap prompt size so a caller cannot send a huge
// payload and inflate upstream token usage.
const MAX_PROMPT_LENGTH = 2000;

// Fix (Vuln #13 - CWE-306 Missing Authentication for Critical Function):
// This endpoint spends a paid third-party API quota, so it must not be
// reachable anonymously. authMiddleware rejects requests without a valid JWT.
router.post("/generate", authMiddleware, geminiLimiter, async (req, res) => {
  try {
    // ------ Validate Input ------
    const { text } = req.body;

    if (!text || typeof text !== "string" || text.trim() === "") {
      return res.status(400).json({
        status: "Error",
        message: "Text prompt is required"
      });
    }

    // Fix (Vuln #13 - CWE-770): reject oversized prompts.
    if (text.length > MAX_PROMPT_LENGTH) {
      return res.status(400).json({
        status: "Error",
        message: `Text prompt must be ${MAX_PROMPT_LENGTH} characters or fewer`
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
    // Fix (Vuln #13 - CWE-598 Sensitive Data in URL):
    // The API key was previously interpolated into the query string, where it
    // can be captured by server logs, proxies and browser history. It is now
    // sent in the x-goog-api-key request header instead.
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        contents: [
          {
            parts: [{ text: sustainabilityPrompt }]
          }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY
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
    // Security: Prevent internal error details from being exposed to clients.
    // Log upstream API error details server-side only; do not forward error.response?.data to the client.
    logger.error("Gemini API error", {
      status: error.response?.status,
      error: error.message
    });

    const upstreamStatus = error.response?.status || 500;
    return res.status(upstreamStatus).json({
      status: "Error",
      message: "Failed to generate recommendations"
    });
  }
});

module.exports = router;
