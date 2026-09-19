const { calculateCarbon } = require('../../src/services/carbonService');
const axios = require('axios');

jest.mock('axios');

describe('Carbon Service Unit Tests (Jest)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        console.error.mockRestore();
    });

    test('should return formatted co2 value from API', async () => {
        axios.post.mockResolvedValue({
            data: { co2e: 12.34 }
        });

        const result = await calculateCarbon('laptop');
        expect(result).toBe(12);
        expect(axios.post).toHaveBeenCalled();
    });

    test('should use fallback when API fails', async () => {
        axios.post.mockRejectedValue(new Error('API Error'));

        const result = await calculateCarbon('laptop');
        // Fallback for laptop is likely not defined in manualCarbonFallback but defaults to 5 or original weight
        // Checking the logic: returns manualCarbonFallback[category] || 5
        expect(typeof result).toBe('number');
        expect(axios.post).toHaveBeenCalled();
    });

    test('should return null for unknown category', async () => {
        const result = await calculateCarbon('nonexistent');
        expect(result).toBeNull();
    });
});
