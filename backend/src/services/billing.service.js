const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const paypal = require('@paypal/checkout-server-sdk');
const { products, discounts, commissions } = require('../config/products');
const { User, Subscription, Invoice, Transaction } = require('../models');

class BillingService {
    constructor() {
        this.paypalClient = new paypal.core.PayPalHttpClient(
            new paypal.core.SandboxEnvironment(
                process.env.PAYPAL_CLIENT_ID,
                process.env.PAYPAL_CLIENT_SECRET
            )
        );
    }

    async createSubscription(userId, productType, plan, billingCycle) {
        try {
            const user = await User.findByPk(userId);
            if (!user) throw new Error('User not found');

            const productConfig = products[productType][plan];
            if (!productConfig) throw new Error('Invalid product configuration');

            let price = productConfig.price[billingCycle];
            if (price === 'custom') {
                throw new Error('Custom pricing requires manual setup');
            }

            // Aplicar descuentos
            if (billingCycle === 'quarterly') {
                price = price * (1 - discounts.quarterly);
            } else if (billingCycle === 'annual') {
                price = price * (1 - discounts.annual);
            }

            // Crear suscripción en la base de datos
            const subscription = await Subscription.create({
                userId,
                productType,
                plan,
                billingCycle,
                price,
                status: 'pending',
                features: productConfig.features
            });

            return subscription;
        } catch (error) {
            console.error('Error creating subscription:', error);
            throw error;
        }
    }

    async processPayment(subscriptionId, paymentMethod, paymentDetails) {
        try {
            const subscription = await Subscription.findByPk(subscriptionId, {
                include: [{ model: User, as: 'user' }]
            });

            if (!subscription) throw new Error('Subscription not found');

            let paymentResult;
            if (paymentMethod === 'stripe') {
                paymentResult = await this.processStripePayment(subscription, paymentDetails);
            } else if (paymentMethod === 'paypal') {
                paymentResult = await this.processPayPalPayment(subscription, paymentDetails);
            } else {
                throw new Error('Invalid payment method');
            }

            // Calcular comisiones
            const platformCommission = subscription.price * commissions.platform;
            const affiliateCommission = subscription.price * commissions.affiliate;

            // Crear transacción
            const transaction = await Transaction.create({
                subscriptionId,
                userId: subscription.userId,
                amount: subscription.price,
                paymentMethod,
                status: 'completed',
                commissionAmount: platformCommission + affiliateCommission,
                paymentDetails: paymentResult
            });

            // Actualizar estado de suscripción
            await subscription.update({
                status: 'active',
                lastPaymentDate: new Date(),
                nextBillingDate: this.calculateNextBillingDate(subscription.billingCycle)
            });

            // Crear factura
            await Invoice.create({
                userId: subscription.userId,
                subscriptionId,
                amount: subscription.price,
                status: 'paid',
                items: [{
                    description: `${subscription.plan} Plan - ${subscription.billingCycle}`,
                    amount: subscription.price
                }],
                paymentDetails: paymentResult
            });

            return transaction;
        } catch (error) {
            console.error('Error processing payment:', error);
            throw error;
        }
    }

    async processStripePayment(subscription, paymentDetails) {
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(subscription.price * 100), // Stripe requires cents
                currency: 'usd',
                customer: subscription.user.stripeCustomerId,
                payment_method: paymentDetails.paymentMethodId,
                confirm: true,
                description: `${subscription.plan} Plan - ${subscription.billingCycle}`
            });

            return {
                provider: 'stripe',
                transactionId: paymentIntent.id,
                status: paymentIntent.status
            };
        } catch (error) {
            console.error('Stripe payment error:', error);
            throw error;
        }
    }

    async processPayPalPayment(subscription, paymentDetails) {
        try {
            const request = new paypal.orders.OrdersCreateRequest();
            request.prefer("return=representation");
            request.requestBody({
                intent: 'CAPTURE',
                purchase_units: [{
                    amount: {
                        currency_code: 'USD',
                        value: subscription.price.toString()
                    },
                    description: `${subscription.plan} Plan - ${subscription.billingCycle}`
                }]
            });

            const order = await this.paypalClient.execute(request);

            return {
                provider: 'paypal',
                transactionId: order.result.id,
                status: order.result.status
            };
        } catch (error) {
            console.error('PayPal payment error:', error);
            throw error;
        }
    }

    calculateNextBillingDate(billingCycle) {
        const date = new Date();
        switch(billingCycle) {
            case 'monthly':
                date.setMonth(date.getMonth() + 1);
                break;
            case 'quarterly':
                date.setMonth(date.getMonth() + 3);
                break;
            case 'annual':
                date.setFullYear(date.getFullYear() + 1);
                break;
        }
        return date;
    }

    async cancelSubscription(subscriptionId, reason) {
        try {
            const subscription = await Subscription.findByPk(subscriptionId);
            if (!subscription) throw new Error('Subscription not found');

            // Si hay un ID de suscripción de Stripe, cancelar allí también
            if (subscription.stripeSubscriptionId) {
                await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
            }

            await subscription.update({
                status: 'cancelled',
                cancellationDate: new Date(),
                cancellationReason: reason
            });

            return subscription;
        } catch (error) {
            console.error('Error cancelling subscription:', error);
            throw error;
        }
    }

    async generateInvoice(subscriptionId) {
        try {
            const subscription = await Subscription.findByPk(subscriptionId, {
                include: [{ model: User, as: 'user' }]
            });

            if (!subscription) throw new Error('Subscription not found');

            const invoice = await Invoice.create({
                userId: subscription.userId,
                subscriptionId,
                amount: subscription.price,
                status: 'pending',
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
                items: [{
                    description: `${subscription.plan} Plan - ${subscription.billingCycle}`,
                    amount: subscription.price
                }]
            });

            return invoice;
        } catch (error) {
            console.error('Error generating invoice:', error);
            throw error;
        }
    }
}

module.exports = new BillingService();
