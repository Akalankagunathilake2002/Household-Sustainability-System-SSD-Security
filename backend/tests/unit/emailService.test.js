const nodemailer = require('nodemailer');
// We don't import sendEmail here because we want to require it inside tests after resetting modules

describe('Email Service Unit Tests (Jest)', () => {
    let mockSendMail;
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv, EMAIL_USER: 'test@gmail.com', EMAIL_PASS: 'password' };
        mockSendMail = jest.fn().mockResolvedValue({ messageId: '123' });

        jest.mock('nodemailer', () => ({
            createTransport: jest.fn().mockReturnValue({
                sendMail: mockSendMail
            })
        }));

        jest.spyOn(console, 'log').mockImplementation(() => { });
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        process.env = originalEnv;
        console.log.mockRestore();
        console.error.mockRestore();
    });

    test('should send an email with correct parameters', async () => {
        const sendEmail = require('../../src/services/emailService');
        await sendEmail('test@example.com', 'Subject', 'Text', '<html></html>');

        expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
            to: 'test@example.com',
            subject: 'Subject',
            text: 'Text',
            html: '<html></html>'
        }));
    });

    test('should handle email sending failure', async () => {
        const sendEmail = require('../../src/services/emailService');
        const nodemailerMock = require('nodemailer');
        const transport = nodemailerMock.createTransport();
        transport.sendMail.mockRejectedValue(new Error('SMTP Error'));

        await sendEmail('test@example.com', 'Subject', 'Text');

        expect(transport.sendMail).toHaveBeenCalled();
    });

    afterAll(() => {
        process.env = originalEnv;
    });
});
