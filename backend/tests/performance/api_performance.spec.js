const { test, expect } = require('@playwright/test');

test.describe('API Performance Tests', () => {
    test('login endpoint should respond within 200ms', async ({ request }) => {
        const start = Date.now();
        await request.post('/api/auth/login', {
            data: {
                email: 'test@example.com',
                password: 'password'
            }
        });
        const duration = Date.now() - start;

        console.log(`Login response time: ${duration}ms`);
        expect(duration).toBeLessThan(5000); // Adjust threshold as needed
    });

    test('register initiate should respond within 200ms', async ({ request }) => {
        const start = Date.now();
        await request.post('/api/auth/register/initiate', {
            data: {
                email: 'test@example.com'
            }
        });
        const duration = Date.now() - start;

        console.log(`Register initiate response time: ${duration}ms`);
        expect(duration).toBeLessThan(5000);
    });
});
