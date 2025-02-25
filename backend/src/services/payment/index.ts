import { PayPalService } from './paypal';
import { StripeService } from './stripe';
import { config } from '@/config/services';

export type PaymentProvider = 'stripe' | 'paypal';

export interface PaymentAmount {
  amount: number;
  currency: string;
}

export interface PaymentIntent {
  id: string;
  provider: PaymentProvider;
  amount: PaymentAmount;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentOptions {
  amount: number;
  currency: string;
  provider?: PaymentProvider;
  description?: string;
  metadata?: Record<string, any>;
}

export interface RefundOptions {
  paymentIntentId: string;
  amount?: number;
  reason?: string;
}

class PaymentService {
  private defaultProvider: PaymentProvider = 'stripe';

  constructor() {
    // Inicializar servicios
    if (config.paypal.enabled) {
      PayPalService.initPayPalClient();
    }
  }

  // Crear un nuevo pago
  async createPayment(options: CreatePaymentOptions): Promise<PaymentIntent> {
    const provider = options.provider || this.defaultProvider;
    
    try {
      if (provider === 'stripe') {
        const stripePayment = await StripeService.createPaymentIntent({
          amount: options.amount,
          currency: options.currency,
          description: options.description,
          metadata: options.metadata
        });

        return {
          id: stripePayment.id,
          provider: 'stripe',
          amount: {
            amount: options.amount,
            currency: options.currency
          },
          status: 'pending',
          metadata: options.metadata,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      } else {
        const paypalOrder = await PayPalService.createOrder(
          options.amount,
          options.currency,
          options.description || ''
        );

        return {
          id: paypalOrder.orderId,
          provider: 'paypal',
          amount: {
            amount: options.amount,
            currency: options.currency
          },
          status: 'pending',
          metadata: options.metadata,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }
    } catch (error) {
      console.error(`Error creating payment with ${provider}:`, error);
      throw error;
    }
  }

  // Capturar un pago
  async capturePayment(paymentIntentId: string, provider: PaymentProvider): Promise<PaymentIntent> {
    try {
      if (provider === 'stripe') {
        const capture = await StripeService.capturePaymentIntent(paymentIntentId);
        return {
          id: capture.id,
          provider: 'stripe',
          amount: {
            amount: capture.amount,
            currency: capture.currency
          },
          status: 'completed',
          paymentMethod: capture.payment_method,
          createdAt: new Date(capture.created * 1000),
          updatedAt: new Date()
        };
      } else {
        const capture = await PayPalService.capturePayment(paymentIntentId);
        return {
          id: capture.captureId,
          provider: 'paypal',
          amount: {
            amount: Number(capture.amount.value),
            currency: capture.amount.currency_code
          },
          status: 'completed',
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }
    } catch (error) {
      console.error(`Error capturing payment with ${provider}:`, error);
      throw error;
    }
  }

  // Reembolsar un pago
  async refundPayment(options: RefundOptions): Promise<PaymentIntent> {
    const { paymentIntentId, amount, reason } = options;
    
    try {
      // Determinar el proveedor basado en el ID del pago
      const provider = this.getProviderFromPaymentId(paymentIntentId);
      
      if (provider === 'stripe') {
        const refund = await StripeService.refundPayment(paymentIntentId, amount);
        return {
          id: refund.id,
          provider: 'stripe',
          amount: {
            amount: refund.amount,
            currency: refund.currency
          },
          status: 'refunded',
          metadata: { reason },
          createdAt: new Date(refund.created * 1000),
          updatedAt: new Date()
        };
      } else {
        const refund = await PayPalService.refundPayment(paymentIntentId, amount);
        return {
          id: refund.refundId,
          provider: 'paypal',
          amount: {
            amount: Number(refund.amount.value),
            currency: refund.amount.currency_code
          },
          status: 'refunded',
          metadata: { reason },
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }
    } catch (error) {
      console.error(`Error refunding payment:`, error);
      throw error;
    }
  }

  // Verificar estado de un pago
  async checkPaymentStatus(paymentIntentId: string, provider: PaymentProvider): Promise<PaymentIntent> {
    try {
      if (provider === 'stripe') {
        const payment = await StripeService.retrievePaymentIntent(paymentIntentId);
        return {
          id: payment.id,
          provider: 'stripe',
          amount: {
            amount: payment.amount,
            currency: payment.currency
          },
          status: this.mapStripeStatus(payment.status),
          paymentMethod: payment.payment_method,
          metadata: payment.metadata,
          createdAt: new Date(payment.created * 1000),
          updatedAt: new Date()
        };
      } else {
        const order = await PayPalService.getPaymentStatus(paymentIntentId);
        return {
          id: paymentIntentId,
          provider: 'paypal',
          amount: {
            amount: Number(order.purchaseUnits[0].amount.value),
            currency: order.purchaseUnits[0].amount.currency_code
          },
          status: this.mapPayPalStatus(order.status),
          metadata: order,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }
    } catch (error) {
      console.error(`Error checking payment status with ${provider}:`, error);
      throw error;
    }
  }

  // Manejar webhook
  async handleWebhook(provider: PaymentProvider, event: any): Promise<void> {
    try {
      if (provider === 'stripe') {
        await StripeService.handleWebhook(event);
      } else {
        await PayPalService.handleWebhook(event);
      }
    } catch (error) {
      console.error(`Error handling ${provider} webhook:`, error);
      throw error;
    }
  }

  // Utilidades privadas
  private getProviderFromPaymentId(paymentId: string): PaymentProvider {
    // PayPal IDs suelen comenzar con 'PAY-' o tienen un formato específico
    if (paymentId.startsWith('PAY-') || paymentId.includes('-')) {
      return 'paypal';
    }
    return 'stripe';
  }

  private mapStripeStatus(status: string): PaymentIntent['status'] {
    switch (status) {
      case 'succeeded':
        return 'completed';
      case 'requires_payment_method':
      case 'requires_confirmation':
      case 'requires_action':
        return 'pending';
      case 'canceled':
        return 'failed';
      default:
        return 'pending';
    }
  }

  private mapPayPalStatus(status: string): PaymentIntent['status'] {
    switch (status) {
      case 'COMPLETED':
        return 'completed';
      case 'CREATED':
      case 'SAVED':
      case 'APPROVED':
        return 'pending';
      case 'VOIDED':
      case 'DECLINED':
        return 'failed';
      default:
        return 'pending';
    }
  }
}

export const paymentService = new PaymentService();
