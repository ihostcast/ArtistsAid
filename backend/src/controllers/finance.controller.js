const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Organization = require('../models/Organization');
const Transaction = require('../models/Transaction');
const { validateWithdrawalRequest } = require('../schemas/validation');

exports.getFinancialData = async (req, res) => {
  try {
    const { id } = req.params;
    const organization = await Organization.findByPk(id);

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Get Stripe account balance
    const balance = await stripe.balance.retrieve({
      stripeAccount: organization.stripeAccountId
    });

    // Calculate total raised
    const totalRaised = await Transaction.sum('amount', {
      where: {
        organizationId: id,
        type: 'donation',
        status: 'completed'
      }
    });

    // Calculate monthly revenue
    const monthlyRevenue = await Transaction.sum('amount', {
      where: {
        organizationId: id,
        type: 'donation',
        status: 'completed',
        createdAt: {
          [Op.gte]: new Date(new Date().setDate(1)) // First day of current month
        }
      }
    });

    res.json({
      availableBalance: balance.available[0].amount / 100,
      totalRaised: totalRaised,
      monthlyRevenue: monthlyRevenue,
      bankAccount: organization.bankCredentials
    });
  } catch (error) {
    console.error('Error fetching financial data:', error);
    res.status(500).json({ error: 'Error fetching financial data' });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const { id } = req.params;
    const { range = 'month', page = 1, limit = 20 } = req.query;

    let dateFilter = {};
    const now = new Date();

    switch (range) {
      case 'week':
        dateFilter = {
          createdAt: {
            [Op.gte]: new Date(now.setDate(now.getDate() - 7))
          }
        };
        break;
      case 'month':
        dateFilter = {
          createdAt: {
            [Op.gte]: new Date(now.setMonth(now.getMonth() - 1))
          }
        };
        break;
      case 'year':
        dateFilter = {
          createdAt: {
            [Op.gte]: new Date(now.setFullYear(now.getFullYear() - 1))
          }
        };
        break;
    }

    const transactions = await Transaction.findAndCountAll({
      where: {
        organizationId: id,
        ...dateFilter
      },
      include: [
        {
          model: User,
          as: 'donor',
          attributes: ['id', 'name']
        },
        {
          model: Cause,
          attributes: ['id', 'title']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: limit,
      offset: (page - 1) * limit
    });

    res.json({
      transactions: transactions.rows,
      total: transactions.count,
      pages: Math.ceil(transactions.count / limit)
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Error fetching transactions' });
  }
};

exports.connectBankAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { stripeToken } = req.body;

    const organization = await Organization.findByPk(id);
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Create or update Stripe Custom account
    let stripeAccount = organization.stripeAccountId;
    if (!stripeAccount) {
      const account = await stripe.accounts.create({
        type: 'custom',
        country: 'US',
        capabilities: {
          transfers: { requested: true }
        }
      });
      stripeAccount = account.id;
    }

    // Add bank account to Stripe account
    const bankAccount = await stripe.accounts.createExternalAccount(
      stripeAccount,
      { external_account: stripeToken }
    );

    // Update organization with bank details
    await organization.update({
      stripeAccountId: stripeAccount,
      bankCredentials: {
        bankName: bankAccount.bank_name,
        last4: bankAccount.last4,
        status: 'verified'
      }
    });

    res.json({ message: 'Bank account connected successfully' });
  } catch (error) {
    console.error('Error connecting bank account:', error);
    res.status(500).json({ error: 'Error connecting bank account' });
  }
};

exports.processWithdrawal = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    const { error } = validateWithdrawalRequest(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const organization = await Organization.findByPk(id);
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    if (!organization.stripeAccountId) {
      return res.status(400).json({ error: 'No bank account connected' });
    }

    // Create transfer to connected account
    const transfer = await stripe.transfers.create({
      amount: amount * 100, // Convert to cents
      currency: 'usd',
      destination: organization.stripeAccountId
    });

    // Create transaction record
    await Transaction.create({
      organizationId: id,
      type: 'withdrawal',
      amount: -amount, // Negative amount for withdrawal
      status: 'completed',
      stripeTransferId: transfer.id
    });

    res.json({ message: 'Withdrawal processed successfully' });
  } catch (error) {
    console.error('Error processing withdrawal:', error);
    res.status(500).json({ error: 'Error processing withdrawal' });
  }
};
