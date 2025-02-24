const { Automation, AutomationLog, Module } = require('../models');
const { catchAsync } = require('../utils/catchAsync');
const { Op } = require('sequelize');

// Obtener todas las automatizaciones
exports.getAllAutomations = catchAsync(async (req, res) => {
  const { type, moduleId, isActive } = req.query;
  const where = {};

  if (type) where.type = type;
  if (moduleId) where.moduleId = moduleId;
  if (isActive !== undefined) where.isActive = isActive === 'true';

  const automations = await Automation.findAll({
    where,
    include: [
      {
        model: Module,
        as: 'module',
        attributes: ['name', 'type', 'version']
      }
    ],
    order: [['createdAt', 'DESC']]
  });

  res.json(automations);
});

// Obtener una automatización específica
exports.getAutomation = catchAsync(async (req, res) => {
  const automation = await Automation.findByPk(req.params.id, {
    include: [
      {
        model: Module,
        as: 'module',
        attributes: ['name', 'type', 'version']
      },
      {
        model: AutomationLog,
        as: 'logs',
        limit: 10,
        order: [['createdAt', 'DESC']]
      }
    ]
  });

  if (!automation) {
    return res.status(404).json({
      status: 'error',
      message: 'Automatización no encontrada'
    });
  }

  res.json(automation);
});

// Crear una nueva automatización
exports.createAutomation = catchAsync(async (req, res) => {
  const {
    name,
    description,
    type,
    moduleId,
    config,
    isActive
  } = req.body;

  const automation = await Automation.create({
    name,
    description,
    type,
    moduleId,
    config,
    isActive,
    createdBy: req.user.id
  });

  res.status(201).json(automation);
});

// Actualizar una automatización
exports.updateAutomation = catchAsync(async (req, res) => {
  const {
    name,
    description,
    config,
    isActive
  } = req.body;

  const automation = await Automation.findByPk(req.params.id);

  if (!automation) {
    return res.status(404).json({
      status: 'error',
      message: 'Automatización no encontrada'
    });
  }

  await automation.update({
    name,
    description,
    config,
    isActive
  });

  res.json(automation);
});

// Eliminar una automatización
exports.deleteAutomation = catchAsync(async (req, res) => {
  const automation = await Automation.findByPk(req.params.id);

  if (!automation) {
    return res.status(404).json({
      status: 'error',
      message: 'Automatización no encontrada'
    });
  }

  await automation.destroy();

  res.status(204).send();
});

// Obtener logs de una automatización
exports.getAutomationLogs = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const where = { automationId: req.params.id };

  if (status) where.status = status;

  const logs = await AutomationLog.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: (page - 1) * limit,
    order: [['createdAt', 'DESC']]
  });

  res.json({
    logs: logs.rows,
    total: logs.count,
    page: parseInt(page),
    totalPages: Math.ceil(logs.count / limit)
  });
});

// Ejecutar una automatización manualmente
exports.runAutomation = catchAsync(async (req, res) => {
  const automation = await Automation.findByPk(req.params.id);

  if (!automation) {
    return res.status(404).json({
      status: 'error',
      message: 'Automatización no encontrada'
    });
  }

  // Aquí iría la lógica para ejecutar la automatización
  // Por ahora solo registramos un log de prueba
  const log = await AutomationLog.create({
    automationId: automation.id,
    status: 'success',
    executionTime: 1000,
    details: { message: 'Ejecución manual iniciada' },
    input: req.body,
    output: { status: 'completed' }
  });

  res.json({
    message: 'Automatización ejecutada correctamente',
    log
  });
});

// Obtener estadísticas de automatización
exports.getAutomationStats = catchAsync(async (req, res) => {
  const stats = await AutomationLog.findAll({
    where: {
      automationId: req.params.id,
      createdAt: {
        [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) // últimas 24 horas
      }
    },
    attributes: [
      'status',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      [sequelize.fn('AVG', sequelize.col('executionTime')), 'avgExecutionTime']
    ],
    group: ['status']
  });

  res.json(stats);
});
