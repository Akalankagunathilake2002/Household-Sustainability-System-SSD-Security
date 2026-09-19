const wasteController = require('../../src/controllers/wasteController');
const WasteRequest = require('../../src/models/WasteRequest');

jest.mock('../../src/models/WasteRequest');

describe('Waste Controller Unit Tests (Jest)', () => {
    let req, res;

    beforeEach(() => {
        req = { body: {}, user: { id: 'user123' }, params: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        jest.clearAllMocks();
    });

    describe('createRequest', () => {
        test('should create a waste request', async () => {
            req.body = { binLevel: 80 };
            WasteRequest.prototype.save = jest.fn().mockResolvedValue({ _id: 'req123', binLevel: 80 });

            await wasteController.createRequest(req, res);

            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ binLevel: 80 }));
        });
    });

    describe('updateStatus', () => {
        test('should return 404 if request not found', async () => {
            req.params.id = 'invalid';
            WasteRequest.findById.mockResolvedValue(null);

            await wasteController.updateStatus(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });
});
