const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEmail = async (to, subject, text, html=null) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
        html
    };

    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            // Security: Prevent sensitive data from being written to application logs.
            // Authentication credentials, OTPs, tokens, and sensitive request data must not be logged.
            // In mock mode only log that an email was attempted, never log the recipient, subject, or body
            // as these may contain OTPs, password-reset links, or other sensitive content.
            logger.info("Mock email mode active – email send skipped (no credentials configured)");
            return;
        }
        await transporter.sendMail(mailOptions);
        logger.info("Email sent successfully");
    } catch (error) {
        // Security: Prevent internal error details from being exposed to application logs.
        // Do not log the recipient address, subject, body, or full error object as they may
        // contain OTPs, credentials, or sensitive SMTP diagnostic information.
        logger.error("Email send failed", { error: error.message });
    }
};

module.exports = sendEmail;