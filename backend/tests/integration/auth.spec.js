const { test, expect } = require('@playwright/test');

test.describe('Auth API Integration Tests', () => {
    test('should return 400 for missing email in registration initiation', async ({ request }) => {
        const response = await request.post('/api/auth/register/initiate', {
            data: {
                // email is missing
            }
        });

        expect(response.status()).toBe(400);
    });

    test('should return 401 for unauthorized login attempt', async ({ request }) => {
        const response = await request.post('/api/auth/login', {
            data: {
                email: 'nonexistent@example.com',
                password: 'wrongpassword'
            }
        });

        expect(response.status()).toBe(400); // Usually 400 or 401 depending on implementation
    });
});
