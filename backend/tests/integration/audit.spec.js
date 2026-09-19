const { test, expect } = require('@playwright/test');
const { generateTestToken } = require('../helpers/authHelper');

test.describe('Audit API Integration Tests', () => {
    let token;

    test.beforeAll(() => {
        token = generateTestToken();
    });

    test('should create a sustainability audit', async ({ request }) => {
        const response = await request.post('/api/audit', {
            headers: { 'Authorization': `Bearer ${token}` },
            data: {
                energyConsumption: 150,
                waterUsage: 200,
                wasteRecycled: 10
            }
        });
        expect(response.status()).not.toBe(401);
    });

    test('should fetch user latest audit', async ({ request }) => {
        const response = await request.get('/api/audit', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        expect(response.ok()).toBeTruthy();
    });
});
