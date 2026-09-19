#!/bin/bash

BASE_URL="http://localhost:5001/api"

# 1. Register Admin
echo "Registering Admin..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "adminUser",
    "email": "admin@example.com",
    "password": "password123",
    "role": "admin"
  }')
echo "Register Response: $REGISTER_RESPONSE"

# 2. Login Admin
echo "Logging in Admin..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }')
echo "Login Response: $LOGIN_RESPONSE"

ADMIN_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Admin Token: $ADMIN_TOKEN"

if [ -z "$ADMIN_TOKEN" ]; then
  echo "Failed to get admin token. Exiting."
  exit 1
fi

# 3. Get All Audits (As Admin)
echo "Getting All Audits (Admin)..."
GET_ALL_RESPONSE=$(curl -s -X GET "$BASE_URL/audit/all" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
echo "Get All Response: $GET_ALL_RESPONSE"

# 4. Login User (Regular)
echo "Logging in Regular User..."
USER_LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "audit@example.com",
    "password": "password123"
  }')
USER_TOKEN=$(echo $USER_LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "User Token: $USER_TOKEN"

# 5. Get All Audits (As User) - Should Fail
echo "Getting All Audits (User) - Should Fail..."
GET_ALL_FAIL_RESPONSE=$(curl -s -X GET "$BASE_URL/audit/all" \
  -H "Authorization: Bearer $USER_TOKEN")
echo "Get All Response (Fail): $GET_ALL_FAIL_RESPONSE"
