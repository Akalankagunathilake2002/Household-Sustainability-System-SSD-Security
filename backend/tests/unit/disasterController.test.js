const disasterController = require('../../src/controllers/disasterController');
const Disaster = require('../../src/models/Disaster');

jest.mock('../../src/models/Disaster');

describe('Disaster Controller Unit Tests (Jest)', () => {
    let req, res;

    beforeEach(() => {
        req = { body: {}, user: { id: 'user123' }, params: {}, query: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis()
        };
        jest.clearAllMocks();
    });

    describe('createDisaster', () => {
        test('should return 400 if required fields missing', async () => {
            req.body = { title: 'Flood' };
            await disasterController.createDisaster(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('should create disaster successfully', async () => {
            req.body = {
                title: 'Big Flood',
                type: 'Flood',
                locationName: 'Colombo',
                latitude: 6.9,
                longitude: 79.8
            };
            Disaster.create.mockResolvedValue({ _id: 'd123', ...req.body });

            await disasterController.createDisaster(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ title: 'Big Flood' }));
        });
    });

    describe('getDisasterById', () => {
        test('should return 404 if not found', async () => {
            req.params.id = 'invalid';
            Disaster.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue(null)
            });

            await disasterController.getDisasterById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });
});
