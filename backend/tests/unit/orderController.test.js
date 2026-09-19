const orderController = require('../../src/controllers/orderController');
const Order = require('../../src/models/Order');
const Product = require('../../src/models/Product');
const User = require('../../src/models/User');
const { sendOrderPlacedEmail } = require('../../src/services/orderEmailService');

jest.mock('../../src/models/Order');
jest.mock('../../src/models/Product');
jest.mock('../../src/models/User');
jest.mock('../../src/services/orderEmailService');
jest.mock('../../src/services/sustainabilityService');

describe('Order Controller Unit Tests (Jest)', () => {
    let req, res;

    beforeEach(() => {
        req = { body: {}, user: { id: 'buyer123' }, params: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        jest.clearAllMocks();
    });

    describe('createOrder', () => {
        test('should return 400 if product not available', async () => {
            req.body.productId = 'prod123';
            Product.findById.mockResolvedValue({ status: 'Sold' });

            await orderController.createOrder(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "This product is not available for purchase." }));
        });

        test('should create order successfully', async () => {
            req.body.productId = 'prod123';
            const mockProduct = {
                _id: 'prod123',
                status: 'Available',
                seller: 'seller456',
                save: jest.fn().mockResolvedValue(true)
            };
            Product.findById.mockResolvedValue(mockProduct);
            Order.prototype.save = jest.fn().mockResolvedValue(true);
            User.findById.mockResolvedValue({ email: 'test@example.com' });
            sendOrderPlacedEmail.mockResolvedValue(true);

            await orderController.createOrder(req, res);

            expect(mockProduct.status).toBe('Reserved');
            expect(res.status).toHaveBeenCalledWith(201);
        });
    });
});
