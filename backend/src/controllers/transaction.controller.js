const { Transaction, Cause, Organization } = require('../models');

exports.create = async (req, res) => {
  try {
    const { amount, causeId, paymentMethod } = req.body;
    const userId = req.user.id;

    const cause = await Cause.findByPk(causeId);
    if (!cause) {
      return res.status(404).json({ message: 'Cause not found' });
    }

    const transaction = await Transaction.create({
      amount,
      causeId,
      userId,
      organizationId: cause.organizationId,
      type: 'donation',
      paymentMethod,
      status: 'pending'
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Error creating transaction', error: error.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id, {
      include: [
        { model: Cause },
        { model: Organization }
      ]
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transaction', error: error.message });
  }
};

exports.list = async (req, res) => {
  try {
    const { organizationId, causeId, type, status } = req.query;
    const where = {};

    if (organizationId) {
      where.organizationId = organizationId;
    }
    if (causeId) {
      where.causeId = causeId;
    }
    if (type) {
      where.type = type;
    }
    if (status) {
      where.status = status;
    }

    // Si no es admin, solo ver transacciones propias o de su organización
    if (req.user.role !== 'admin') {
      where.userId = req.user.id;
    }

    const transactions = await Transaction.findAll({
      where,
      include: [
        { model: Cause },
        { model: Organization }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions', error: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const transaction = await Transaction.findByPk(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Solo admin o líder de la organización puede actualizar el estado
    const organization = await Organization.findByPk(transaction.organizationId);
    if (organization.leaderId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await transaction.update({ status });

    // Si la transacción es exitosa y es una donación, actualizar el monto recaudado
    if (status === 'completed' && transaction.type === 'donation') {
      const cause = await Cause.findByPk(transaction.causeId);
      if (cause) {
        await cause.update({
          raisedAmount: cause.raisedAmount + transaction.amount
        });
      }
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Error updating transaction status', error: error.message });
  }
};
