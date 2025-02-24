const { Receipt, Cause, User } = require('../models');

const createReceipt = async (req, res) => {
  try {
    const {
      causeId,
      fileUrl,
      description,
      amount,
      date
    } = req.body;

    const cause = await Cause.findByPk(causeId);
    if (!cause) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Cause not found'
      });
    }

    if (cause.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to upload receipts for this cause'
      });
    }

    const receipt = await Receipt.create({
      causeId,
      uploadedBy: req.user.id,
      fileUrl,
      description,
      amount,
      date,
      status: 'pending'
    });

    res.status(201).json(receipt);
  } catch (error) {
    console.error('Create receipt error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};

const getReceipts = async (req, res) => {
  try {
    const where = {};
    if (req.user.role === 'artist') {
      where.uploadedBy = req.user.id;
    }

    const receipts = await Receipt.findAll({
      where,
      include: [
        {
          model: Cause,
          attributes: ['id', 'title', 'userId']
        },
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'firstName', 'lastName']
        }
      ],
      order: [['date', 'DESC']]
    });

    res.json(receipts);
  } catch (error) {
    console.error('Get receipts error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};

const getReceipt = async (req, res) => {
  try {
    const receipt = await Receipt.findByPk(req.params.id, {
      include: [
        {
          model: Cause,
          attributes: ['id', 'title', 'userId']
        },
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });

    if (!receipt) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Receipt not found'
      });
    }

    if (req.user.role === 'artist' && receipt.uploadedBy !== req.user.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to view this receipt'
      });
    }

    res.json(receipt);
  } catch (error) {
    console.error('Get receipt error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};

const updateReceipt = async (req, res) => {
  try {
    const receipt = await Receipt.findByPk(req.params.id);

    if (!receipt) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Receipt not found'
      });
    }

    const { status } = req.body;
    if (status) {
      receipt.status = status;
      receipt.verifiedBy = req.user.id;
      receipt.verificationDate = new Date();
    }

    await receipt.save();

    res.json(receipt);
  } catch (error) {
    console.error('Update receipt error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};

const deleteReceipt = async (req, res) => {
  try {
    const receipt = await Receipt.findByPk(req.params.id);

    if (!receipt) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Receipt not found'
      });
    }

    await receipt.destroy();

    res.json({
      message: 'Receipt deleted successfully'
    });
  } catch (error) {
    console.error('Delete receipt error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
};

module.exports = {
  createReceipt,
  getReceipts,
  getReceipt,
  updateReceipt,
  deleteReceipt
};
