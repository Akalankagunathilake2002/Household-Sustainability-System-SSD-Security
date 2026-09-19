const axios = require("axios");

// ⚠️ Hardcode URL (avoid env issues)
const BASE_URL = "https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries";

const mapType = (type) => {
  if (!type) return "Other";

  type = type.toLowerCase();

  if (type.includes("flood")) return "Flood";
  if (type.includes("fire")) return "Fire";
  if (type.includes("earthquake")) return "Earthquake";
  if (type.includes("storm")) return "Storm";
  if (type.includes("drought")) return "Drought";

  return "Other";
};

const fetchFemaDisasters = async () => {
  try {
    const res = await axios.get(BASE_URL, {
      params: { $limit: 10 }
    });

    return res.data.DisasterDeclarationsSummaries.map((item) => ({
      externalId: String(item.disasterNumber),
      title: item.declarationTitle || "Disaster Event",
      description: item.incidentType || "",
      type: mapType(item.incidentType),
      locationName: item.state || "Unknown",
      latitude: 0,
      longitude: 0,
      severity: "high",
      status: "active",
      source: "fema",
      createdAt: item.declarationDate,
    }));

  } catch (err) {
    console.error("🔥 FEMA ERROR:", err.response?.data || err.message);
    throw err;
  }
};

module.exports = { fetchFemaDisasters };