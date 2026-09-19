const { test, expect } = require('@playwright/test');
const { generateTestToken } = require('../helpers/authHelper');

test.describe('Weather API Integration Tests', () => {
    let token;

    test.beforeAll(() => {
        token = generateTestToken();
    });

    test('should return 400 when fetching weather without coordinates', async ({ request }) => {
        const response = await request.get('/api/weather', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        // Controller should handle missing lat/lon
        expect(response.status()).toBe(400);
    });

    test('should fetch weather and forecast status (behavior check)', async ({ request }) => {
        const response = await request.get('/api/weather?lat=7.0&lon=80.0', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        // Might return 200 or error if API key is invalid, but shouldn't be 401
        expect(response.status()).not.toBe(401);
    });
});
