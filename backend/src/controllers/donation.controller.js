const { Donation, User, Cause } = require('../models');

const createDonation = async (req, res) => {
  try {
    const {
      causeId,
      amount,
      paymentMethod,
      isAnonymous,
      message
    } = req.body;

    const cause = await Cause.findByPk(causeId);
    if (!cause) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Cause not found'
      });
    }

    const donation = await Donation.create({
      causeId,
      donorId: req.user.id,
      amount,
      paymentMethod,
      isAnonymous,
      message,
      status: 'pending',
      transactionId: `DON-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    });

    res.status(201).json(donation);
  } catch (error) {
    console.error('Create donation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};

const getDonations = async (req, res) => {
  try {
    const where = {};
    if (req.user.role === 'artist') {
      where.donorId = req.user.id;
    }

    const donations = await Donation.findAll({
      where,
      include: [
        {
          model: User,
          as: 'donor',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: Cause,
          attributes: ['id', 'title', 'userId']
        }
      ]
    });

    res.json(donations);
  } catch (error) {
    console.error('Get donations error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};

const getDonation = async (req, res) => {
  try {
    const donation = await Donation.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'donor',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: Cause,
          attributes: ['id', 'title', 'userId']
        }
      ]
    });

    if (!donation) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Donation not found'
      });
    }

    if (req.user.role === 'artist' && donation.donorId !== req.user.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to view this donation'
      });
    }

    res.json(donation);
  } catch (error) {
    console.error('Get donation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};

const updateDonation = async (req, res) => {
  try {
    const donation = await Donation.findByPk(req.params.id);

    if (!donation) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Donation not found'
      });
    }

    const { status } = req.body;
    if (status) {
      donation.status = status;
      if (status === 'completed') {
        const cause = await Cause.findByPk(donation.causeId);
        cause.amountRaised = parseFloat(cause.amountRaised) + parseFloat(donation.amount);
        await cause.save();
      }
    }

    await donation.save();

    res.json(donation);
  } catch (error) {
    console.error('Update donation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};

const deleteDonation = async (req, res) => {
  try {
    const donation = await Donation.findByPk(req.params.id);

    if (!donation) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Donation not found'
      });
    }

    if (donation.status === 'completed') {
      const cause = await Cause.findByPk(donation.causeId);
      cause.amountRaised = parseFloat(cause.amountRaised) - parseFloat(donation.amount);
      await cause.save();
    }

    await donation.destroy();

    res.json({
      message: 'Donation deleted successfully'
    });
  } catch (error) {
    console.error('Delete donation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};

module.exports = {
  createDonation,
  getDonations,
  getDonation,
  updateDonation,
  deleteDonation
};
