const productController = require('../../src/controllers/productController');
const Product = require('../../src/models/Product');
const { calculateCarbon } = require('../../src/services/carbonService');

jest.mock('../../src/models/Product');
jest.mock('../../src/services/carbonService');

describe('Product Controller Unit Tests (Jest)', () => {
    let req, res;

    beforeEach(() => {
        req = { body: {}, user: { id: 'user123' }, params: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        jest.clearAllMocks();
    });

    describe('createProduct', () => {
        test('should return 400 if title or category missing', async () => {
            req.body = { description: 'test' };
            await productController.createProduct(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('should create product and calculate carbon', async () => {
            req.body = { title: 'Test Product', category: 'laptop' };
            req.file = { path: 'https://cloudinary.com/test.png' };
            calculateCarbon.mockResolvedValue(1.8);
            Product.prototype.save = jest.fn().mockResolvedValue(true);

            await productController.createProduct(req, res);

            expect(calculateCarbon).toHaveBeenCalledWith('laptop');
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Product listed successfully." }));
        });
    });

    describe('updateProduct', () => {
        test('should return 404 if product not found', async () => {
            req.params.id = 'invalid';
            Product.findById.mockResolvedValue(null);

            await productController.updateProduct(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        test('should return 403 if user is not the seller', async () => {
            req.params.id = 'prod123';
            req.user.id = 'otherUser';
            Product.findById.mockResolvedValue({
                seller: 'user123',
                status: 'Available',
                toString: () => 'prod123'
            });

            await productController.updateProduct(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
        });
    });
});
