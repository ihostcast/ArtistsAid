import Stripe from 'stripe';
import { services } from '../../config/services';

const stripe = new Stripe(services.stripe.secretKey, {
  apiVersion: '2023-10-16'
});

export const createPaymentIntent = async (amount: number, currency: string = 'usd') => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
    });
    return paymentIntent;
  } catch (error) {
    throw new Error('Error creating payment intent');
  }
};

export const handleWebhook = async (body: any, signature: string) => {
  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      services.stripe.webhookSecret
    );
    return event;
  } catch (error) {
    throw new Error('Webhook signature verification failed');
  }
};
