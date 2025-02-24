const nodemailer = require('nodemailer');

const emailConfig = {
    development: {
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER || 'artistsaid.com@gmail.com',
            pass: process.env.EMAIL_PASS
        }
    },
    production: {
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER || 'artistsaid.com@gmail.com',
            pass: process.env.EMAIL_PASS
        }
    }
};

const createTransporter = () => {
    const config = process.env.NODE_ENV === 'production' 
        ? emailConfig.production 
        : emailConfig.development;
    
    return nodemailer.createTransport(config);
};

module.exports = { createTransporter };
