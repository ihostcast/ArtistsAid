import sgMail from '@sendgrid/mail';
import mailgun from 'mailgun-js';
import { services } from '../../config/services';

const setupEmailService = () => {
  if (services.email.service === 'sendgrid') {
    sgMail.setApiKey(services.email.apiKey);
    return {
      send: async (to: string, subject: string, html: string) => {
        const msg = {
          to,
          from: services.email.from,
          subject,
          html,
        };
        await sgMail.send(msg);
      }
    };
  } else if (services.email.service === 'mailgun') {
    const mg = mailgun({ apiKey: services.email.apiKey, domain: 'your-domain.com' });
    return {
      send: async (to: string, subject: string, html: string) => {
        const data = {
          from: services.email.from,
          to,
          subject,
          html
        };
        await mg.messages().send(data);
      }
    };
  }
  throw new Error('Email service not configured');
};

export const emailService = setupEmailService();
