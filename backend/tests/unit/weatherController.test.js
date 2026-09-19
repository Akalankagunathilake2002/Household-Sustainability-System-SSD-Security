const weatherController = require('../../src/controllers/weatherController');
const axios = require('axios');

jest.mock('axios');

describe('Weather Controller Unit Tests (Jest)', () => {
    let req, res;
    const originalEnv = process.env;

    beforeEach(() => {
        process.env = { ...originalEnv, OPENWEATHER_API_KEY: 'mockKey' };
        req = { query: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        jest.clearAllMocks();
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    describe('getWeather', () => {
        test('should return 400 if no location parameters', async () => {
            await weatherController.getWeather(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('should fetch weather and return formatted data', async () => {
            req.query = { city: 'Colombo' };
            axios.get.mockResolvedValue({
                data: {
                    name: 'Colombo',
                    main: { temp: 30, humidity: 80 },
                    weather: [{ description: 'sunny', icon: '01d' }],
                    wind: { speed: 5 }
                }
            });

            await weatherController.getWeather(req, res);

            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                city: 'Colombo',
                temp: 30
            }));
        });
    });
});
