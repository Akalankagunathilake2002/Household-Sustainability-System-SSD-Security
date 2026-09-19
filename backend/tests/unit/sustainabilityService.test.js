const { awardSustainabilityPoints } = require('../../src/services/sustainabilityService');
const User = require('../../src/models/User');

jest.mock('../../src/models/User');

describe('Sustainability Service Unit Tests (Jest)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should award points for co2 saved to both buyer and seller', async () => {
        const mockBuyer = {
            _id: 'user123',
            sustainabilityScore: 100,
            save: jest.fn().mockResolvedValue(true)
        };
        const mockSeller = {
            _id: 'seller456',
            sustainabilityScore: 50,
            save: jest.fn().mockResolvedValue(true)
        };

        const mockOrder = {
            buyer: 'user123',
            product: {
                seller: 'seller456',
                co2Saved: 5
            }
        };

        User.findById
            .mockResolvedValueOnce(mockBuyer)
            .mockResolvedValueOnce(mockSeller);

        await awardSustainabilityPoints(mockOrder);

        expect(User.findById).toHaveBeenCalledTimes(2);
        expect(mockBuyer.sustainabilityScore).toBe(105);
        expect(mockSeller.sustainabilityScore).toBe(55);
        expect(mockBuyer.save).toHaveBeenCalled();
        expect(mockSeller.save).toHaveBeenCalled();
    });

    test('should not award points if co2 is 0 or less', async () => {
        const mockOrder = {
            product: { co2Saved: 0 }
        };

        await awardSustainabilityPoints(mockOrder);

        expect(User.findById).not.toHaveBeenCalled();
    });
});
