const { test, expect } = require('@playwright/test');
const { generateTestToken } = require('../helpers/authHelper');

test.describe('Order API Integration Tests', () => {
    let token;

    test.beforeAll(() => {
        token = generateTestToken();
    });

    test('should return 400 when creating order without product ID', async ({ request }) => {
        const response = await request.post('/api/orders', {
            headers: { 'Authorization': `Bearer ${token}` },
            data: {
                // missing productId
            }
        });
        expect(response.status()).toBe(400);
    });

    test('should fetch user orders', async ({ request }) => {
        const response = await request.get('/api/orders/my', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        expect(response.ok()).toBeTruthy();
    });
});
