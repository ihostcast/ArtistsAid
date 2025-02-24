const twilio = require('twilio');

const TWILIO_VERIFY_SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID;

const smsConfig = {
    development: {
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
        verifyServiceSid: TWILIO_VERIFY_SERVICE_SID
    },
    production: {
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
        verifyServiceSid: TWILIO_VERIFY_SERVICE_SID
    }
};

const createTwilioClient = () => {
    const config = process.env.NODE_ENV === 'production' 
        ? smsConfig.production 
        : smsConfig.development;
    
    return twilio(config.accountSid, config.authToken);
};

const sendVerificationCode = async (phoneNumber) => {
    const client = createTwilioClient();
    const config = process.env.NODE_ENV === 'production' 
        ? smsConfig.production 
        : smsConfig.development;

    try {
        const verification = await client.verify.v2
            .services(config.verifyServiceSid)
            .verifications
            .create({ to: phoneNumber, channel: 'sms' });
        
        return verification.status;
    } catch (error) {
        console.error('Error sending verification:', error);
        throw error;
    }
};

const checkVerificationCode = async (phoneNumber, code) => {
    const client = createTwilioClient();
    const config = process.env.NODE_ENV === 'production' 
        ? smsConfig.production 
        : smsConfig.development;

    try {
        const verificationCheck = await client.verify.v2
            .services(config.verifyServiceSid)
            .verificationChecks
            .create({ to: phoneNumber, code });

        return verificationCheck.status === 'approved';
    } catch (error) {
        console.error('Error checking verification:', error);
        throw error;
    }
};

module.exports = { 
    createTwilioClient,
    sendVerificationCode,
    checkVerificationCode
};
