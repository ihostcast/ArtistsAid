import twilio from 'twilio';
import { services } from '../../config/services';

const client = twilio(services.twilio.accountSid, services.twilio.authToken);

export const sendSMS = async (to: string, body: string) => {
  try {
    const message = await client.messages.create({
      body,
      to,
      from: services.twilio.phoneNumber
    });
    return message;
  } catch (error) {
    throw new Error('Error sending SMS');
  }
};

export const verifyPhoneNumber = async (phoneNumber: string) => {
  try {
    const verification = await client.verify.v2
      .services(services.twilio.verifyServiceSid)
      .verifications.create({ to: phoneNumber, channel: 'sms' });
    return verification;
  } catch (error) {
    throw new Error('Error verifying phone number');
  }
};
