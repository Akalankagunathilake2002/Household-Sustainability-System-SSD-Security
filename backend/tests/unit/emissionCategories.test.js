const { emissionCategories, allowedCategories } = require('../../src/utils/emissionCategories');

describe('Emission Categories Unit Tests (Jest)', () => {
    test('should have defined emission categories', () => {
        expect(emissionCategories).toBeDefined();
        expect(typeof emissionCategories).toBe('object');
    });

    test('should include essential categories', () => {
        expect(allowedCategories).toContain('laptop');
        expect(allowedCategories).toContain('phone');
        expect(allowedCategories).toContain('clothing');
    });

    test('laptop should have correct weight and activityId', () => {
        expect(emissionCategories.laptop.weight).toBe(1.8);
        expect(emissionCategories.laptop.activityId).toBe('metals-type_aluminum_production');
    });

    test('other category should use fallback', () => {
        expect(emissionCategories.other.useFallback).toBe(true);
    });
});
