const { test, expect } = require('@playwright/test');
const { generateTestToken } = require('../helpers/authHelper');

test.describe('Disaster API Integration Tests', () => {
    let token;

    test.beforeAll(() => {
        token = generateTestToken();
    });

    test('should fetch disasters with token', async ({ request }) => {
        const response = await request.get('/api/disasters', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        expect(response.ok()).toBeTruthy();
        const body = await response.json();
        expect(Array.isArray(body)).toBeTruthy();
    });

    test('should return 401 for submitting disaster without token', async ({ request }) => {
        const response = await request.post('/api/disasters', {
            data: {
                type: 'Flood',
                location: 'Colombo',
                description: 'Heavy rain'
            }
        });
        expect(response.status()).toBe(401);
    });
});
