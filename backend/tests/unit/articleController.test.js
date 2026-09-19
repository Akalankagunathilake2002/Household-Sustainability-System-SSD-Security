const articleController = require('../../src/controllers/articleController');
const Article = require('../../src/models/Article');

jest.mock('../../src/models/Article');

describe('Article Controller Unit Tests (Jest)', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {},
            user: { id: 'admin123', role: 'admin' },
            params: {},
            query: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        jest.clearAllMocks();
    });

    describe('createArticle', () => {
        test('should create article successfully', async () => {
            req.body = { title: 'News', content: 'Long content', category: 'Tech' };
            Article.prototype.save = jest.fn().mockResolvedValue({ _id: 'art123', ...req.body });

            await articleController.createArticle(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
        });
    });

    describe('getArticles', () => {
        test('should fetch published articles', async () => {
            const mockArticles = [{ title: 'Art 1', isPublished: true }];
            Article.find.mockReturnValue({
                sort: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue(mockArticles)
            });

            await articleController.getArticles(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ count: 1 }));
        });
    });

    describe('deleteArticle', () => {
        test('should delete article', async () => {
            req.params.id = 'art123';
            Article.findByIdAndDelete.mockResolvedValue({ _id: 'art123' });

            await articleController.deleteArticle(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Article deleted successfully' }));
        });

        test('should return 404 if not found', async () => {
            req.params.id = 'art123';
            Article.findByIdAndDelete.mockResolvedValue(null);

            await articleController.deleteArticle(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });
});
