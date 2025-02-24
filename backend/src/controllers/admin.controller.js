const { User, Organization, Cause, Transaction } = require('../models');
const ModuleManager = require('../services/ModuleManager');
const { catchAsync } = require('../utils/catchAsync');

const getOverview = async (req, res) => {
  try {
    const [users, organizations, causes, transactions] = await Promise.all([
      User.count(),
      Organization.count(),
      Cause.count(),
      Transaction.count()
    ]);

    const recentUsers = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    const recentCauses = await Cause.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'name']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    const recentTransactions = await Transaction.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'name']
        },
        {
          model: Cause,
          attributes: ['id', 'title']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    res.json({
      stats: {
        users,
        organizations,
        causes,
        transactions
      },
      recent: {
        users: recentUsers,
        causes: recentCauses,
        transactions: recentTransactions
      }
    });
  } catch (error) {
    console.error('Error getting overview:', error);
    res.status(500).json({ message: 'Error getting overview', error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

    res.json(users);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ message: 'Error getting users', error: error.message });
  }
};

const getAllOrganizations = async (req, res) => {
  try {
    const organizations = await Organization.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'name']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(organizations);
  } catch (error) {
    console.error('Error getting organizations:', error);
    res.status(500).json({ message: 'Error getting organizations', error: error.message });
  }
};

const getAllCauses = async (req, res) => {
  try {
    const causes = await Cause.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'name']
        },
        {
          model: Organization,
          attributes: ['id', 'name']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(causes);
  } catch (error) {
    console.error('Error getting causes:', error);
    res.status(500).json({ message: 'Error getting causes', error: error.message });
  }
};

const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'name']
        },
        {
          model: Cause,
          attributes: ['id', 'title']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(transactions);
  } catch (error) {
    console.error('Error getting transactions:', error);
    res.status(500).json({ message: 'Error getting transactions', error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.update({ name, email, role });

    res.json({
      message: 'User updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.destroy();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

// Gestión de Módulos
exports.installModule = catchAsync(async (req, res) => {
  const { type } = req.body;
  const moduleFile = req.files.module;

  const module = await ModuleManager.installModule(moduleFile, type);
  res.status(201).json({
    status: 'success',
    data: { module }
  });
});

exports.activateModule = catchAsync(async (req, res) => {
  const { moduleId } = req.params;

  await ModuleManager.activateModule(moduleId);
  res.status(200).json({
    status: 'success',
    message: 'Módulo activado correctamente'
  });
});

exports.updateModuleConfig = catchAsync(async (req, res) => {
  const { moduleId } = req.params;
  const { config } = req.body;

  await ModuleManager.updateModuleConfig(moduleId, config);
  res.status(200).json({
    status: 'success',
    message: 'Configuración actualizada correctamente'
  });
});

exports.listModules = catchAsync(async (req, res) => {
  const { type } = req.query;

  const modules = await ModuleManager.listModules(type);
  res.status(200).json({
    status: 'success',
    data: { modules }
  });
});

module.exports = {
  getOverview,
  getAllUsers,
  getAllOrganizations,
  getAllCauses,
  getAllTransactions,
  updateUser,
  deleteUser,
  installModule: exports.installModule,
  activateModule: exports.activateModule,
  updateModuleConfig: exports.updateModuleConfig,
  listModules: exports.listModules
};
