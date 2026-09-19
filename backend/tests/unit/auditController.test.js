const auditController = require('../../src/controllers/auditController');
const SustainabilityAudit = require('../../src/models/SustainabilityAudit');
const ScoringConfig = require('../../src/models/ScoringConfig');
const User = require('../../src/models/User');

jest.mock('../../src/models/SustainabilityAudit');
jest.mock('../../src/models/ScoringConfig');
jest.mock('../../src/models/User');

describe('Audit Controller Unit Tests (Jest)', () => {
    let req, res;

    beforeEach(() => {
        req = { body: {}, user: { id: 'user123' }, params: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis()
        };
        jest.clearAllMocks();
    });

    describe('createAudit', () => {
        test('should calculate score and save audit', async () => {
            req.body = {
                environmental: { electricityUsage: 50, solarPanels: true },
                social: { communityParticipation: true },
                economic: { sustainableShopping: true }
            };

            ScoringConfig.findOne.mockResolvedValue({
                environmental: {
                    electricityUsageThreshold1: 100, electricityUsagePoints1: 20,
                    solarPanelsPoints: 10, waterUsagePoints1: 10, waterSavingTapsPoints: 10, wasteSeparationPoints: 10
                },
                social: { communityParticipationPoints: 10, safeNeighborhoodPoints: 10, publicTransportUsagePoints: 10 },
                economic: { sustainableShoppingPoints: 10, energyEfficientAppliancesPoints: 10, budgetTrackingPoints: 10 }
            });

            SustainabilityAudit.prototype.save = jest.fn().mockResolvedValue({ _id: 'audit123' });

            await auditController.createAudit(req, res);

            expect(SustainabilityAudit.prototype.save).toHaveBeenCalled();
            expect(User.findByIdAndUpdate).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalled();
        });
    });
});
