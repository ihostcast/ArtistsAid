const { Cause, User, Transaction } = require('../models');

exports.getAllCauses = async (req, res) => {
  try {
    const causes = await Cause.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'name']
        }
      ]
    });

    res.json({ causes });
  } catch (error) {
    console.error('Get all causes error:', error);
    res.status(500).json({ message: 'Error fetching causes', error: error.message });
  }
};

exports.getCauseById = async (req, res) => {
  try {
    const cause = await Cause.findByPk(req.params.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'name']
        }
      ]
    });

    if (!cause) {
      return res.status(404).json({ message: 'Cause not found' });
    }

    res.json({ cause });
  } catch (error) {
    console.error('Get cause error:', error);
    res.status(500).json({ message: 'Error fetching cause', error: error.message });
  }
};

exports.createCause = async (req, res) => {
  try {
    const { title, description, goalAmount, category, deadline } = req.body;

    const cause = await Cause.create({
      title,
      description,
      goalAmount,
      category,
      deadline,
      userId: req.user.id,
      status: 'pending'
    });

    res.status(201).json({
      message: 'Cause created successfully',
      cause
    });
  } catch (error) {
    console.error('Create cause error:', error);
    res.status(500).json({ message: 'Error creating cause', error: error.message });
  }
};

exports.updateCause = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, goalAmount, category, deadline } = req.body;

    const cause = await Cause.findByPk(id);
    if (!cause) {
      return res.status(404).json({ message: 'Cause not found' });
    }

    // Solo el creador puede actualizar la causa
    if (cause.userId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to update this cause' });
    }

    await cause.update({
      title,
      description,
      goalAmount,
      category,
      deadline
    });

    res.json({
      message: 'Cause updated successfully',
      cause
    });
  } catch (error) {
    console.error('Update cause error:', error);
    res.status(500).json({ message: 'Error updating cause', error: error.message });
  }
};

exports.deleteCause = async (req, res) => {
  try {
    const { id } = req.params;

    const cause = await Cause.findByPk(id);
    if (!cause) {
      return res.status(404).json({ message: 'Cause not found' });
    }

    // Solo el creador puede eliminar la causa
    if (cause.userId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to delete this cause' });
    }

    await cause.destroy();

    res.json({ message: 'Cause deleted successfully' });
  } catch (error) {
    console.error('Delete cause error:', error);
    res.status(500).json({ message: 'Error deleting cause', error: error.message });
  }
};

exports.getCauseDonations = async (req, res) => {
  try {
    const { id } = req.params;

    const cause = await Cause.findByPk(id, {
      include: [
        {
          model: Transaction,
          where: { type: 'donation' },
          include: [
            {
              model: User,
              attributes: ['id', 'name']
            }
          ]
        }
      ]
    });

    if (!cause) {
      return res.status(404).json({ message: 'Cause not found' });
    }

    res.json({ donations: cause.Transactions });
  } catch (error) {
    console.error('Get cause donations error:', error);
    res.status(500).json({ message: 'Error fetching donations', error: error.message });
  }
};

exports.approveCause = async (req, res) => {
  try {
    const { id } = req.params;

    const cause = await Cause.findByPk(id);
    if (!cause) {
      return res.status(404).json({ message: 'Cause not found' });
    }

    await cause.update({ status: 'approved' });

    res.json({
      message: 'Cause approved successfully',
      cause
    });
  } catch (error) {
    console.error('Approve cause error:', error);
    res.status(500).json({ message: 'Error approving cause', error: error.message });
  }
};

exports.rejectCause = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const cause = await Cause.findByPk(id);
    if (!cause) {
      return res.status(404).json({ message: 'Cause not found' });
    }

    await cause.update({
      status: 'rejected',
      rejectionReason: reason
    });

    res.json({
      message: 'Cause rejected successfully',
      cause
    });
  } catch (error) {
    console.error('Reject cause error:', error);
    res.status(500).json({ message: 'Error rejecting cause', error: error.message });
  }
};

exports.verifyCause = async (req, res) => {
  try {
    const { id } = req.params;

    const cause = await Cause.findByPk(id);
    if (!cause) {
      return res.status(404).json({ message: 'Cause not found' });
    }

    await cause.update({ isVerified: true });

    res.json({
      message: 'Cause verified successfully',
      cause
    });
  } catch (error) {
    console.error('Verify cause error:', error);
    res.status(500).json({ message: 'Error verifying cause', error: error.message });
  }
};

exports.addCauseEvidence = async (req, res) => {
  try {
    const { files, links, description } = req.body;
    const cause = await Cause.findByPk(req.params.id);

    if (!cause) {
      return res.status(404).json({ message: 'Cause not found' });
    }

    // Verificar si el usuario tiene permiso
    if (cause.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to add evidence to this cause' });
    }

    const evidence = {
      ...cause.evidence,
      files: [...(cause.evidence.files || []), ...(files || [])],
      links: [...(cause.evidence.links || []), ...(links || [])],
      description: description || cause.evidence.description
    };

    await cause.update({ evidence });

    res.json({
      message: 'Evidence added successfully',
      evidence
    });
  } catch (error) {
    console.error('Add cause evidence error:', error);
    res.status(500).json({ message: 'Error adding cause evidence', error: error.message });
  }
};

exports.getCauseEvidence = async (req, res) => {
  try {
    const cause = await Cause.findByPk(req.params.id);

    if (!cause) {
      return res.status(404).json({ message: 'Cause not found' });
    }

    res.json({ evidence: cause.evidence });
  } catch (error) {
    console.error('Get cause evidence error:', error);
    res.status(500).json({ message: 'Error fetching cause evidence', error: error.message });
  }
};

exports.updateCauseStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const cause = await Cause.findByPk(req.params.id);

    if (!cause) {
      return res.status(404).json({ message: 'Cause not found' });
    }

    await cause.update({ status });

    res.json({
      message: 'Cause status updated successfully',
      cause
    });
  } catch (error) {
    console.error('Update cause status error:', error);
    res.status(500).json({ message: 'Error updating cause status', error: error.message });
  }
};

exports.getCauseTransactions = async (req, res) => {
  try {
    const cause = await Cause.findByPk(req.params.id, {
      include: [
        {
          model: Transaction,
          include: [
            {
              model: User,
              attributes: ['id', 'name']
            }
          ]
        }
      ]
    });

    if (!cause) {
      return res.status(404).json({ message: 'Cause not found' });
    }

    res.json({ transactions: cause.Transactions });
  } catch (error) {
    console.error('Get cause transactions error:', error);
    res.status(500).json({ message: 'Error fetching cause transactions', error: error.message });
  }
};

module.exports = {
  getAllCauses: exports.getAllCauses,
  getCauseById: exports.getCauseById,
  createCause: exports.createCause,
  updateCause: exports.updateCause,
  deleteCause: exports.deleteCause,
  getCauseDonations: exports.getCauseDonations,
  addCauseEvidence: exports.addCauseEvidence,
  getCauseEvidence: exports.getCauseEvidence,
  updateCauseStatus: exports.updateCauseStatus,
  getCauseTransactions: exports.getCauseTransactions,
  approveCause: exports.approveCause,
  rejectCause: exports.rejectCause,
  verifyCause: exports.verifyCause
};
