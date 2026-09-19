#!/bin/bash

BASE_URL="http://localhost:5001/api"

# 1. Register User (if not already registered)
echo "Registering User..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "auditUser",
    "email": "audit@example.com",
    "password": "password123"
  }')
echo "Register Response: $REGISTER_RESPONSE"

# 2. Login User
echo "Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "audit@example.com",
    "password": "password123"
  }')
echo "Login Response: $LOGIN_RESPONSE"

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Token: $TOKEN"

if [ -z "$TOKEN" ]; then
  echo "Failed to get token. Exiting."
  exit 1
fi

# 3. Create Audit
echo "Creating Audit..."
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/audit" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "environmental": {
        "electricityUsage": 120,
        "solarPanels": true,
        "waterSavingTaps": true,
        "wasteSeparation": true
    },
    "social": {
        "communityParticipation": true,
        "safeNeighborhood": true,
        "publicTransportUsage": true
    },
    "economic": {
        "energyEfficientAppliances": true,
        "budgetTracking": true,
        "sustainableShopping": true
    }
  }')
echo "Create Response: $CREATE_RESPONSE"

# 4. Get Audit
echo "Getting Audit..."
GET_RESPONSE=$(curl -s -X GET "$BASE_URL/audit" \
  -H "Authorization: Bearer $TOKEN")
echo "Get Response: $GET_RESPONSE"

AUDIT_ID=$(echo $GET_RESPONSE | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
echo "Audit ID: $AUDIT_ID"

# 5. Check User Score
echo "Checking User Score..."
USER_PROFILE_RESPONSE=$(curl -s -X GET "$BASE_URL/user/profile" \
  -H "Authorization: Bearer $TOKEN")
echo "User Profile Response: $USER_PROFILE_RESPONSE"

# 6. Update Audit
echo "Updating Audit..."
UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/audit/$AUDIT_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "environmental": {
        "electricityUsage": 400,
        "solarPanels": false,
        "waterSavingTaps": false,
        "wasteSeparation": false
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
  }')
echo "Update Response: $UPDATE_RESPONSE"

# 7. Check User Score Again
echo "Checking User Score Again..."
USER_PROFILE_RESPONSE_2=$(curl -s -X GET "$BASE_URL/user/profile" \
  -H "Authorization: Bearer $TOKEN")
echo "User Profile Response 2: $USER_PROFILE_RESPONSE_2"

# 8. Delete Audit
echo "Deleting Audit..."
DELETE_RESPONSE=$(curl -s -X DELETE "$BASE_URL/audit/$AUDIT_ID" \
  -H "Authorization: Bearer $TOKEN")
echo "Delete Response: $DELETE_RESPONSE"
