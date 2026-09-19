#!/bin/bash

BASE_URL="http://localhost:5001/api"

TIMESTAMP=$(date +%s)

echo "1. Register User"
curl -v -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"testuser_$TIMESTAMP\", \"email\": \"user_$TIMESTAMP@test.com\", \"password\": \"password123\"}"
echo -e "\n"

echo "2. Login User"
USER_TOKEN=$(curl -v -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"user_$TIMESTAMP@test.com\", \"password\": \"password123\"}" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo "Token: $USER_TOKEN"
echo -e "\n"

echo "3. Register Admin"
# Assuming we allowed passing role in body for testing purposes as per controller implementation
curl -v -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"testadmin_$TIMESTAMP\", \"email\": \"admin_$TIMESTAMP@test.com\", \"password\": \"password123\", \"role\": \"admin\"}"
echo -e "\n"

echo "4. Login Admin"
ADMIN_TOKEN=$(curl -v -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"admin_$TIMESTAMP@test.com\", \"password\": \"password123\"}" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

echo "Token: $ADMIN_TOKEN"
echo -e "\n"

echo "5. Access User Profile (User Token)"
curl -v -X GET $BASE_URL/user/profile \
  -H "Authorization: Bearer $USER_TOKEN"
echo -e "\n"

echo "6. Access Admin Dashboard (User Token) - Should Fail"
curl -v -X GET $BASE_URL/admin/dashboard \
  -H "Authorization: Bearer $USER_TOKEN"
echo -e "\n"

echo "7. Access Admin Dashboard (Admin Token)"
curl -v -X GET $BASE_URL/admin/dashboard \
  -H "Authorization: Bearer $ADMIN_TOKEN"
echo -e "\n"
