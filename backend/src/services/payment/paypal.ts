import paypal from '@paypal/checkout-server-sdk';
import { config } from '@/config/services';

let client: paypal.core.PayPalHttpClient;

// Configuración del entorno de PayPal
const environment = () => {
  if (config.paypal.mode === 'live') {
    return new paypal.core.LiveEnvironment(
      config.paypal.clientId,
      config.paypal.clientSecret
    );
  }
  return new paypal.core.SandboxEnvironment(
    config.paypal.clientId,
    config.paypal.clientSecret
  );
};

// Inicializar cliente de PayPal
export const initPayPalClient = () => {
  client = new paypal.core.PayPalHttpClient(environment());
};

export const PayPalService = {
  // Crear orden de pago
  createOrder: async (amount: number, currency: string = 'USD', description: string) => {
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: currency,
          value: amount.toString()
        },
        description
      }]
    });

    try {
      const order = await client.execute(request);
      return {
        orderId: order.result.id,
        status: order.result.status,
        links: order.result.links
      };
    } catch (error) {
      console.error('Error creating PayPal order:', error);
      throw error;
    }
  },

  // Capturar pago
  capturePayment: async (orderId: string) => {
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.prefer("return=representation");

    try {
      const capture = await client.execute(request);
      return {
        captureId: capture.result.purchase_units[0].payments.captures[0].id,
        status: capture.result.status,
        amount: capture.result.purchase_units[0].payments.captures[0].amount
      };
    } catch (error) {
      console.error('Error capturing PayPal payment:', error);
      throw error;
    }
  },

  // Reembolsar pago
  refundPayment: async (captureId: string, amount?: number) => {
    const request = new paypal.payments.CapturesRefundRequest(captureId);
    
    if (amount) {
      request.requestBody({
        amount: {
          value: amount.toString(),
          currency_code: 'USD'
        }
      });
    }

    try {
      const refund = await client.execute(request);
      return {
        refundId: refund.result.id,
        status: refund.result.status,
        amount: refund.result.amount
      };
    } catch (error) {
      console.error('Error refunding PayPal payment:', error);
      throw error;
    }
  },

  // Verificar estado de pago
  getPaymentStatus: async (orderId: string) => {
    const request = new paypal.orders.OrdersGetRequest(orderId);

    try {
      const order = await client.execute(request);
      return {
        status: order.result.status,
        intent: order.result.intent,
        purchaseUnits: order.result.purchase_units
      };
    } catch (error) {
      console.error('Error getting PayPal payment status:', error);
      throw error;
    }
  },

  // Obtener balance de la cuenta
  getBalance: async () => {
    // Note: This requires the Payouts API access
    try {
      const response = await fetch(
        'https://api-m.paypal.com/v1/reporting/balances',
        {
          headers: {
            'Authorization': `Bearer ${await getAccessToken()}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to get balance');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting PayPal balance:', error);
      throw error;
    }
  },

  // Webhook handler
  handleWebhook: async (event: any) => {
    try {
      switch (event.event_type) {
        case 'PAYMENT.CAPTURE.COMPLETED':
          // Manejar pago completado
          await handlePaymentCompleted(event);
          break;
        
        case 'PAYMENT.CAPTURE.REFUNDED':
          // Manejar reembolso
          await handlePaymentRefunded(event);
          break;
        
        case 'PAYMENT.CAPTURE.DENIED':
          // Manejar pago denegado
          await handlePaymentDenied(event);
          break;
        
        default:
          console.log('Unhandled PayPal webhook event:', event.event_type);
      }
    } catch (error) {
      console.error('Error handling PayPal webhook:', error);
      throw error;
    }
  }
};

// Funciones auxiliares
async function getAccessToken(): Promise<string> {
  const auth = Buffer.from(`${config.paypal.clientId}:${config.paypal.clientSecret}`).toString('base64');
  
  const response = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });

  if (!response.ok) {
    throw new Error('Failed to get access token');
  }

  const data = await response.json();
  return data.access_token;
}

async function handlePaymentCompleted(event: any) {
  // Implementar lógica para pagos completados
  // Por ejemplo: actualizar estado de orden, enviar notificación, etc.
}

async function handlePaymentRefunded(event: any) {
  // Implementar lógica para reembolsos
  // Por ejemplo: actualizar estado de orden, enviar notificación, etc.
}

async function handlePaymentDenied(event: any) {
  // Implementar lógica para pagos denegados
  // Por ejemplo: actualizar estado de orden, enviar notificación, etc.
}
