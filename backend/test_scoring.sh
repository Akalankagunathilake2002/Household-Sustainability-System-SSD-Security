#!/bin/bash

BASE_URL="http://localhost:5001/api"

# 1. Login Admin
echo "Logging in Admin..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }')
ADMIN_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$ADMIN_TOKEN" ]; then
  echo "Failed to get admin token. Make sure server is running and admin exists."
  exit 1
fi

# 2. Get Current Config
echo "Getting current scoring config..."
curl -s -X GET "$BASE_URL/admin/scoring-config" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .

# 3. Update Config (Set Solar Panels to 25 points)
echo "Updating scoring config (Solar Panels = 25)..."
curl -s -X PUT "$BASE_URL/admin/scoring-config" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "environmental": {
        "solarPanelsPoints": 25
    }
  }' | jq .

# 4. Create Audit and Verify Score
echo "Logging in Regular User..."
USER_LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "audit@example.com",
    "password": "password123"
  }')
USER_TOKEN=$(echo $USER_LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo "Creating audit with solar panels..."
curl -s -X POST "$BASE_URL/audit" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "environmental": {
        "electricityUsage": 200,
        "solarPanels": true,
        "waterSavingTaps": false,
        "wasteSeparation": false,
        "waterUsage": 150
    },
    "social": {
        "communityParticipation": false,
        "safeNeighborhood": false,
        "publicTransportUsage": false
    },
    "economic": {
        "energyEfficientAppliances": false,
        "budgetTracking": false,
        "sustainableShopping": false
    }
  }' | jq .environmentalScore

echo "Verification complete."
