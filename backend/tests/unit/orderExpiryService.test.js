const { processExpiredOrders } = require('../../src/services/orderExpiryService');
const Order = require('../../src/models/Order');
const Product = require('../../src/models/Product');
const { sendOrderCancelledEmail } = require('../../src/services/orderEmailService');

jest.mock('../../src/models/Order');
jest.mock('../../src/models/Product');
jest.mock('../../src/services/orderEmailService');

describe('Order Expiry Service Unit Tests (Jest)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(() => { });
    });

    afterEach(() => {
        console.log.mockRestore();
    });

    test('should cancel expired orders and restore product status', async () => {
        const mockProduct = {
            _id: 'prod123',
            status: 'Reserved',
            save: jest.fn().mockResolvedValue(true)
        };
        const mockOrder = {
            _id: 'order123',
            status: 'Pending',
            product: mockProduct,
            buyer: { email: 'buyer@test.com' },
            seller: { email: 'seller@test.com' },
            save: jest.fn().mockResolvedValue(true)
        };

        Order.find.mockReturnValue({
            populate: jest.fn().mockReturnThis(),
            [Symbol.iterator]: function* () { yield mockOrder; }
        });

        // Simpler mock for the chain
        const mockFind = {
            populate: jest.fn().mockReturnThis(),
            exec: jest.fn().mockResolvedValue([mockOrder]),
            then: jest.fn(function (resolve) { resolve([mockOrder]); return this; }),
            catch: jest.fn().mockReturnThis()
        };
        Order.find.mockReturnValue(mockFind);
        sendOrderCancelledEmail.mockReturnValue({
            catch: jest.fn().mockReturnThis()
        });

        await processExpiredOrders();

        expect(mockOrder.status).toBe('Cancelled');
        expect(mockProduct.status).toBe('Available');
        expect(mockOrder.save).toHaveBeenCalled();
        expect(mockProduct.save).toHaveBeenCalled();
        expect(sendOrderCancelledEmail).toHaveBeenCalled();
    });
});
