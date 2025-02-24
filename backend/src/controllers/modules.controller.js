const { Module, User, UserModule } = require('../models');
const { Op } = require('sequelize');

exports.listModules = async (req, res) => {
  try {
    const { type, search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (type) where.type = type;
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const modules = await Module.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        modules: modules.rows,
        total: modules.count,
        pages: Math.ceil(modules.count / limit),
        currentPage: parseInt(page)
      }
    });
  } catch (error) {
    console.error('Error listing modules:', error);
    res.status(500).json({
      success: false,
      error: 'Error al listar módulos'
    });
  }
};

exports.getModuleDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const module = await Module.findByPk(id);

    if (!module) {
      return res.status(404).json({
        success: false,
        error: 'Módulo no encontrado'
      });
    }

    res.json({
      success: true,
      data: { module }
    });
  } catch (error) {
    console.error('Error getting module details:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener detalles del módulo'
    });
  }
};

exports.installModule = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const module = await Module.findByPk(id);
    if (!module) {
      return res.status(404).json({
        success: false,
        error: 'Módulo no encontrado'
      });
    }

    // Verificar si el usuario ya tiene el módulo instalado
    const existingInstallation = await UserModule.findOne({
      where: { userId, moduleId: id }
    });

    if (existingInstallation) {
      return res.status(400).json({
        success: false,
        error: 'El módulo ya está instalado'
      });
    }

    // Verificar roles requeridos
    if (module.requiredRoles && module.requiredRoles.length > 0) {
      const user = await User.findByPk(userId);
      if (!module.requiredRoles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          error: 'No tienes los permisos necesarios para instalar este módulo'
        });
      }
    }

    // Crear instalación
    const installation = await UserModule.create({
      userId,
      moduleId: id,
      isActive: true,
      activatedAt: new Date(),
      expiresAt: module.pricing.type === 'subscription' ? 
        new Date(Date.now() + (module.pricing.trialDays * 24 * 60 * 60 * 1000)) : null
    });

    res.json({
      success: true,
      data: { installation }
    });
  } catch (error) {
    console.error('Error installing module:', error);
    res.status(500).json({
      success: false,
      error: 'Error al instalar el módulo'
    });
  }
};

exports.uninstallModule = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const installation = await UserModule.findOne({
      where: { userId, moduleId: id }
    });

    if (!installation) {
      return res.status(404).json({
        success: false,
        error: 'Módulo no instalado'
      });
    }

    await installation.destroy();

    res.json({
      success: true,
      message: 'Módulo desinstalado correctamente'
    });
  } catch (error) {
    console.error('Error uninstalling module:', error);
    res.status(500).json({
      success: false,
      error: 'Error al desinstalar el módulo'
    });
  }
};

exports.updateModuleConfig = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { config } = req.body;

    const installation = await UserModule.findOne({
      where: { userId, moduleId: id }
    });

    if (!installation) {
      return res.status(404).json({
        success: false,
        error: 'Módulo no instalado'
      });
    }

    installation.config = config;
    await installation.save();

    res.json({
      success: true,
      data: { installation }
    });
  } catch (error) {
    console.error('Error updating module config:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar la configuración del módulo'
    });
  }
};

exports.getUserModules = async (req, res) => {
  try {
    const userId = req.user.id;
    const { active } = req.query;

    const where = { userId };
    if (active !== undefined) {
      where.isActive = active === 'true';
    }

    const installations = await UserModule.findAll({
      where,
      include: [{ model: Module }],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: { installations }
    });
  } catch (error) {
    console.error('Error getting user modules:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener módulos del usuario'
    });
  }
};
