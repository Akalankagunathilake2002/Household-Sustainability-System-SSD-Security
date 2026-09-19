const nodemailer = require('nodemailer');

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
            console.log('---------------------------------------------------');
            console.log(`[MOCK EMAIL] To: ${to}`);
            console.log(`[MOCK EMAIL] Subject: ${subject}`);
            console.log(`[MOCK EMAIL] Body: ${text}`);
            console.log('---------------------------------------------------');
            return;
        }
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error('Error sending email:', error);
        // Fallback logging for development
        console.log('---------------------------------------------------');
        console.log(`[FAILED EMAIL LOG] To: ${to}`);
        console.log(`[FAILED EMAIL LOG] Subject: ${subject}`);
        console.log(`[FAILED EMAIL LOG] Body: ${text}`);
        console.log('---------------------------------------------------');
    }
};

module.exports = sendEmail;