const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
    testDir: './tests/integration',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
        baseURL: 'http://127.0.0.1:5001',
        trace: 'on-first-retry',
    },
});
