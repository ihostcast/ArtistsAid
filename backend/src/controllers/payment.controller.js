const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const paypal = require('@paypal/checkout-server-sdk');
const Organization = require('../models/Organization');
const Transaction = require('../models/Transaction');
const { validatePaymentConfig } = require('../schemas/validation');

// Configuración de PayPal
let paypalClient;
if (process.env.NODE_ENV === 'production') {
  paypalClient = new paypal.core.LiveEnvironment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_SECRET
  );
} else {
  paypalClient = new paypal.core.SandboxEnvironment(
    process.env.PAYPAL_SANDBOX_CLIENT_ID,
    process.env.PAYPAL_SANDBOX_SECRET
  );
}
const paypalHttpClient = new paypal.core.PayPalHttpClient(paypalClient);

exports.configureStripe = async (req, res) => {
  try {
    const { id } = req.params;
    const organization = await Organization.findByPk(id);

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Crear o actualizar cuenta Stripe Connect
    let stripeAccount;
    if (!organization.paymentConfig.stripe.accountId) {
      stripeAccount = await stripe.accounts.create({
        type: 'standard',
        country: 'US',
        email: req.body.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true }
        }
      });

      // Actualizar configuración de pagos
      const paymentConfig = {
        ...organization.paymentConfig,
        stripe: {
          enabled: true,
          accountId: stripeAccount.id,
          publicKey: null // Se configurará después de la activación
        }
      };

      await organization.update({ paymentConfig });
    } else {
      stripeAccount = await stripe.accounts.retrieve(
        organization.paymentConfig.stripe.accountId
      );
    }

    // Generar link de onboarding
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccount.id,
      refresh_url: `${process.env.FRONTEND_URL}/organization/${id}/payment-settings`,
      return_url: `${process.env.FRONTEND_URL}/organization/${id}/payment-settings`,
      type: 'account_onboarding'
    });

    res.json({ url: accountLink.url });
  } catch (error) {
    console.error('Error configuring Stripe:', error);
    res.status(500).json({ error: 'Error configuring Stripe payments' });
  }
};

exports.configurePayPal = async (req, res) => {
  try {
    const { id } = req.params;
    const { clientId, secret } = req.body;
    
    const organization = await Organization.findByPk(id);
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Verificar credenciales de PayPal
    const testClient = new paypal.core.SandboxEnvironment(clientId, secret);
    const testHttpClient = new paypal.core.PayPalHttpClient(testClient);
    
    try {
      // Intentar una operación de prueba
      const request = new paypal.orders.OrdersCreateRequest();
      request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'USD',
            value: '0.01'
          }
        }]
      });
      await testHttpClient.execute(request);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid PayPal credentials' });
    }

    // Actualizar configuración de pagos
    const paymentConfig = {
      ...organization.paymentConfig,
      paypal: {
        enabled: true,
        clientId,
        secret,
        webhookId: null // Se configurará al crear el webhook
      }
    };

    await organization.update({ paymentConfig });

    // Configurar webhook de PayPal
    const webhook = await createPayPalWebhook(organization.id, clientId, secret);
    
    paymentConfig.paypal.webhookId = webhook.id;
    await organization.update({ paymentConfig });

    res.json({ message: 'PayPal configuration updated successfully' });
  } catch (error) {
    console.error('Error configuring PayPal:', error);
    res.status(500).json({ error: 'Error configuring PayPal payments' });
  }
};

exports.getPaymentMethods = async (req, res) => {
  try {
    const { id } = req.params;
    const organization = await Organization.findByPk(id);

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    const paymentMethods = {
      stripe: {
        enabled: organization.paymentConfig.stripe.enabled,
        publicKey: organization.paymentConfig.stripe.publicKey
      },
      paypal: {
        enabled: organization.paymentConfig.paypal.enabled,
        clientId: organization.paymentConfig.paypal.clientId
      }
    };

    res.json(paymentMethods);
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ error: 'Error fetching payment methods' });
  }
};

exports.processPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, currency, method, paymentData, causeId } = req.body;

    const organization = await Organization.findByPk(id);
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    let paymentResult;
    let transactionData = {
      organizationId: id,
      causeId,
      amount,
      currency,
      userId: req.user.id,
      status: 'pending'
    };

    if (method === 'stripe') {
      paymentResult = await processStripePayment(
        amount,
        currency,
        paymentData,
        organization
      );
      transactionData.stripePaymentId = paymentResult.id;
    } else if (method === 'paypal') {
      paymentResult = await processPayPalPayment(
        amount,
        currency,
        paymentData,
        organization
      );
      transactionData.paypalOrderId = paymentResult.id;
    } else {
      return res.status(400).json({ error: 'Invalid payment method' });
    }

    // Crear transacción
    const transaction = await Transaction.create(transactionData);

    // Calcular comisión
    const commission = (amount * organization.commissionRate) / 100;
    await createCommissionTransaction(organization.id, commission, currency);

    res.json({
      transactionId: transaction.id,
      paymentResult
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ error: 'Error processing payment' });
  }
};

async function processStripePayment(amount, currency, paymentData, organization) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convertir a centavos
    currency,
    payment_method: paymentData.paymentMethodId,
    confirmation_method: 'manual',
    confirm: true,
    application_fee_amount: Math.round((amount * organization.commissionRate) / 100 * 100),
    transfer_data: {
      destination: organization.paymentConfig.stripe.accountId
    }
  });

  return paymentIntent;
}

async function processPayPalPayment(amount, currency, paymentData, organization) {
  const request = new paypal.orders.OrdersCreateRequest();
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
      amount: {
        currency_code: currency,
        value: amount.toString()
      },
      payee: {
        email_address: organization.paymentConfig.paypal.email
      }
    }]
  });

  const order = await paypalHttpClient.execute(request);
  return order.result;
}

async function createPayPalWebhook(organizationId, clientId, secret) {
  const webhookClient = new paypal.core.SandboxEnvironment(clientId, secret);
  const webhookHttpClient = new paypal.core.PayPalHttpClient(webhookClient);

  const webhook = await webhookHttpClient.execute(
    new paypal.notifications.WebhooksCreateRequest({
      url: `${process.env.API_URL}/webhooks/paypal/${organizationId}`,
      event_types: [
        { name: 'PAYMENT.CAPTURE.COMPLETED' },
        { name: 'PAYMENT.CAPTURE.DENIED' }
      ]
    })
  );

  return webhook.result;
}

async function createCommissionTransaction(organizationId, amount, currency) {
  await Transaction.create({
    type: 'commission',
    amount,
    currency,
    organizationId,
    status: 'completed',
    metadata: {
      description: 'Platform commission fee'
    }
  });
}
