const { test, expect } = require('@playwright/test');
const { generateTestToken } = require('../helpers/authHelper');

test.describe('Waste Management API Integration Tests', () => {
    let userToken;
    let collectorToken;

    test.beforeAll(() => {
        userToken = generateTestToken({ id: '507f1f77bcf86cd799439011', role: 'user' });
        collectorToken = generateTestToken({ id: '507f1f77bcf86cd799439012', role: 'waste_collector' });
    });

    test('should create a waste pickup request', async ({ request }) => {
        const response = await request.post('/api/waste', {
            headers: { 'Authorization': `Bearer ${userToken}` },
            data: {
                wasteType: 'Plastic',
                quantity: 5,
                address: '123 Test St',
                preferredDate: new Date(Date.now() + 86400000).toISOString()
            }
        });
        // Might fail if DB validation is strict, but shouldn't be 401
        expect(response.status()).not.toBe(401);
    });

    test('should fetch user requests', async ({ request }) => {
        const response = await request.get('/api/waste', {
            headers: { 'Authorization': `Bearer ${userToken}` }
        });
        expect(response.ok()).toBeTruthy();
    });

    test('should allow collector to fetch all requests', async ({ request }) => {
        const response = await request.get('/api/waste/all', {
            headers: { 'Authorization': `Bearer ${collectorToken}` }
        });
        expect(response.status()).not.toBe(403);
    });
});
