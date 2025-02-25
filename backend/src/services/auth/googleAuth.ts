import { OAuth2Client } from 'google-auth-library';
import { services } from '../../config/services';

const client = new OAuth2Client(services.google.clientId);

export const verifyGoogleToken = async (token: string) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: services.google.clientId
    });
    const payload = ticket.getPayload();
    return payload;
  } catch (error) {
    throw new Error('Invalid Google token');
  }
};
