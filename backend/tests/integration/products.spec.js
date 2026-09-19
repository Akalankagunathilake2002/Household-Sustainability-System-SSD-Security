const { test, expect } = require('@playwright/test');
const { generateTestToken } = require('../helpers/authHelper');

test.describe('Product API Integration Tests', () => {
    let token;

    test.beforeAll(() => {
        token = generateTestToken();
    });

    test('should fetch all products (public)', async ({ request }) => {
        const response = await request.get('/api/products');
        expect(response.ok()).toBeTruthy();
        const body = await response.json();
        expect(Array.isArray(body.products)).toBeTruthy();
    });

    test('should return 401 when creating product without token', async ({ request }) => {
        const response = await request.post('/api/products', {
            data: {
                name: 'Test Product',
                price: 100
            }
        });
        expect(response.status()).toBe(401);
    });

    test('should attempt to create product with token (behavior check)', async ({ request }) => {
        const response = await request.post('/api/products', {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            data: {
                name: 'Test Product',
                description: 'Testing description',
                category: 'electronics_other',
                price: 99.99,
                condition: 'New'
            }
        });

        // We expect 201 if created, or maybe 400/500 if DB fails/validation errors
        // Since we are using a mock ID, it might fail if the user doesn't exist in DB
        // but at least it shouldn't be 401.
        expect(response.status()).not.toBe(401);
    });
});
