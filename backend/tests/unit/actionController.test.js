const actionController = require('../../src/controllers/actionController');
const Action = require('../../src/models/Action');

jest.mock('../../src/models/Action');

describe('Action Controller Unit Tests (Jest)', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {},
            user: { id: 'user123', role: 'user' },
            params: {},
            query: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis()
        };
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(() => { });
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        console.log.mockRestore();
        console.error.mockRestore();
    });

    describe('createAction', () => {
        test('should create action successfully', async () => {
            req.body = { title: 'Test Action', description: 'Desc', category: 'Energy Efficiency' };
            Action.prototype.save = jest.fn().mockResolvedValue({ _id: 'a123', ...req.body });

            await actionController.createAction(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalled();
        });

        test('should return 500 on save failure', async () => {
            Action.prototype.save = jest.fn().mockRejectedValue(new Error('Save failed'));
            await actionController.createAction(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('getActions', () => {
        test('should fetch and format actions with scores', async () => {
            const mockActions = [
                {
                    _doc: { title: 'Action 1', category: 'Energy Efficiency', likes: [], comments: [] },
                    category: 'Energy Efficiency',
                    likes: [],
                    comments: []
                }
            ];
            Action.find.mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                sort: jest.fn().mockResolvedValue(mockActions)
            });

            await actionController.getActions(req, res);

            expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([
                expect.objectContaining({ totalScore: 15 })
            ]));
        });
    });

    describe('updateAction', () => {
        test('should update if owner', async () => {
            req.params.id = 'a123';
            req.body = { title: 'Updated' };
            const mockAction = { createdBy: 'user123' };
            Action.findById.mockResolvedValue(mockAction);
            Action.findByIdAndUpdate.mockResolvedValue({ ...mockAction, ...req.body });

            await actionController.updateAction(req, res);

            expect(res.json).toHaveBeenCalled();
        });

        test('should return 403 if not owner', async () => {
            req.params.id = 'a123';
            const mockAction = { createdBy: 'otherUser' };
            Action.findById.mockResolvedValue(mockAction);

            await actionController.updateAction(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
        });
    });

    describe('likeAction', () => {
        test('should like an action', async () => {
            req.params.id = 'a123';
            const mockAction = {
                likes: [],
                save: jest.fn().mockResolvedValue(true)
            };
            Action.findById.mockResolvedValue(mockAction);

            await actionController.likeAction(req, res);

            expect(mockAction.likes.length).toBe(1);
            expect(res.json).toHaveBeenCalledWith({ msg: 'Liked' });
        });

        test('should not like twice', async () => {
            req.params.id = 'a123';
            const mockAction = {
                likes: [{ user: 'user123' }],
                save: jest.fn()
            };
            Action.findById.mockResolvedValue(mockAction);

            await actionController.likeAction(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ msg: 'Already liked' });
        });
    });

    describe('reportAction', () => {
        test('should report and flag if 3 reports', async () => {
            req.params.id = 'a123';
            req.body.reason = 'Spam';
            const mockAction = {
                reports: [{ user: 'u1' }, { user: 'u2' }],
                isFlagged: false,
                save: jest.fn().mockResolvedValue(true)
            };
            Action.findById.mockResolvedValue(mockAction);

            await actionController.reportAction(req, res);

            expect(mockAction.reports.length).toBe(3);
            expect(mockAction.isFlagged).toBe(true);
            expect(res.json).toHaveBeenCalledWith({ msg: 'Reported' });
        });
    });
});
