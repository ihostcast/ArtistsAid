const cron = require('node-cron');
const { Automation, AutomationLog, Module } = require('../models');
const { Op } = require('sequelize');

class CronService {
  constructor() {
    this.jobs = new Map();
    this.defaultTasks = [
      {
        name: 'cleanup_logs',
        schedule: '0 0 * * *', // Cada día a medianoche
        handler: this.cleanupLogs.bind(this)
      },
      {
        name: 'check_modules',
        schedule: '0 */6 * * *', // Cada 6 horas
        handler: this.checkModules.bind(this)
      },
      {
        name: 'update_stats',
        schedule: '*/30 * * * *', // Cada 30 minutos
        handler: this.updateStats.bind(this)
      }
    ];
  }

  async initialize() {
    try {
      // Iniciar tareas por defecto
      this.startDefaultTasks();

      // Cargar y programar automatizaciones
      await this.loadAutomations();

      console.log('CronService initialized successfully');
    } catch (error) {
      console.error('Error initializing CronService:', error);
    }
  }

  startDefaultTasks() {
    for (const task of this.defaultTasks) {
      if (cron.validate(task.schedule)) {
        const job = cron.schedule(task.schedule, async () => {
          try {
            await task.handler();
          } catch (error) {
            console.error(`Error executing task ${task.name}:`, error);
          }
        });
        this.jobs.set(task.name, job);
      } else {
        console.error(`Invalid cron schedule for task ${task.name}`);
      }
    }
  }

  async loadAutomations() {
    try {
      const automations = await Automation.findAll({
        where: {
          type: 'schedule',
          isActive: true
        },
        include: [{
          model: Module,
          as: 'module',
          attributes: ['name', 'type', 'config']
        }]
      });

      for (const automation of automations) {
        this.scheduleAutomation(automation);
      }
    } catch (error) {
      console.error('Error loading automations:', error);
    }
  }

  scheduleAutomation(automation) {
    if (!automation.config.cronExpression || !cron.validate(automation.config.cronExpression)) {
      console.error(`Invalid cron expression for automation ${automation.id}`);
      return;
    }

    // Cancelar el trabajo existente si existe
    if (this.jobs.has(automation.id)) {
      this.jobs.get(automation.id).stop();
    }

    const job = cron.schedule(automation.config.cronExpression, async () => {
      try {
        await this.executeAutomation(automation);
      } catch (error) {
        console.error(`Error executing automation ${automation.id}:`, error);
        await this.logAutomationError(automation, error);
      }
    });

    this.jobs.set(automation.id, job);
  }

  async executeAutomation(automation) {
    const startTime = Date.now();
    let status = 'success';
    let error = null;

    try {
      // Ejecutar acciones configuradas
      for (const action of automation.config.actions) {
        await this.executeAction(action, automation);
      }

      // Actualizar estadísticas
      await this.updateAutomationStats(automation, true, Date.now() - startTime);
    } catch (err) {
      status = 'error';
      error = err.message;
      await this.updateAutomationStats(automation, false, Date.now() - startTime);
    }

    // Registrar log
    await AutomationLog.create({
      automationId: automation.id,
      status,
      executionTime: Date.now() - startTime,
      error,
      details: { actions: automation.config.actions }
    });
  }

  async executeAction(action, automation) {
    switch (action.type) {
      case 'moduleFunction':
        await this.executeModuleFunction(action, automation);
        break;
      case 'notification':
        await this.sendNotification(action);
        break;
      case 'database':
        await this.executeDatabaseAction(action);
        break;
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  // Tareas por defecto
  async cleanupLogs() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await AutomationLog.destroy({
      where: {
        createdAt: {
          [Op.lt]: thirtyDaysAgo
        }
      }
    });
  }

  async checkModules() {
    const modules = await Module.findAll({
      where: {
        isActive: true
      }
    });

    for (const module of modules) {
      try {
        // Verificar estado del módulo
        const status = await this.checkModuleStatus(module);
        
        if (!status.healthy) {
          // Enviar notificación si hay problemas
          await this.sendNotification({
            type: 'email',
            config: {
              subject: `Module Health Check: ${module.name}`,
              message: `Module ${module.name} is reporting issues: ${status.message}`
            }
          });
        }
      } catch (error) {
        console.error(`Error checking module ${module.name}:`, error);
      }
    }
  }

  async updateStats() {
    const automations = await Automation.findAll({
      where: {
        isActive: true
      }
    });

    for (const automation of automations) {
      try {
        const stats = await AutomationLog.findAll({
          where: {
            automationId: automation.id,
            createdAt: {
              [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000)
            }
          },
          attributes: [
            'status',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
            [sequelize.fn('AVG', sequelize.col('executionTime')), 'avgTime']
          ],
          group: ['status']
        });

        await automation.update({
          stats: {
            last24h: stats
          }
        });
      } catch (error) {
        console.error(`Error updating stats for automation ${automation.id}:`, error);
      }
    }
  }

  // Helpers
  async updateAutomationStats(automation, success, executionTime) {
    const stats = automation.stats || {
      totalRuns: 0,
      successfulRuns: 0,
      failedRuns: 0,
      averageExecutionTime: 0
    };

    stats.totalRuns++;
    if (success) {
      stats.successfulRuns++;
    } else {
      stats.failedRuns++;
    }

    stats.averageExecutionTime = (
      (stats.averageExecutionTime * (stats.totalRuns - 1) + executionTime) /
      stats.totalRuns
    );

    await automation.update({
      stats,
      lastRun: new Date(),
      nextRun: this.calculateNextRun(automation.config.cronExpression)
    });
  }

  calculateNextRun(cronExpression) {
    try {
      const interval = require('cron-parser').parseExpression(cronExpression);
      return interval.next().toDate();
    } catch (error) {
      console.error('Error calculating next run:', error);
      return null;
    }
  }

  async logAutomationError(automation, error) {
    await AutomationLog.create({
      automationId: automation.id,
      status: 'error',
      error: error.message,
      details: {
        stack: error.stack,
        config: automation.config
      }
    });
  }

  // Métodos de ejecución específicos
  async executeModuleFunction(action, automation) {
    const module = automation.module;
    if (!module || !module.config.functions || !module.config.functions[action.function]) {
      throw new Error(`Function ${action.function} not found in module ${module?.name}`);
    }

    // Aquí iría la lógica para ejecutar la función del módulo
    // Por ahora solo simulamos la ejecución
    console.log(`Executing module function: ${action.function}`);
  }

  async sendNotification(action) {
    // Aquí iría la lógica para enviar notificaciones
    // Por ahora solo simulamos el envío
    console.log(`Sending notification: ${action.config.subject}`);
  }

  async executeDatabaseAction(action) {
    // Aquí iría la lógica para ejecutar acciones en la base de datos
    // Por ahora solo simulamos la ejecución
    console.log(`Executing database action: ${action.operation}`);
  }

  async checkModuleStatus(module) {
    // Aquí iría la lógica para verificar el estado de un módulo
    // Por ahora retornamos un estado simulado
    return {
      healthy: true,
      message: 'Module is running correctly'
    };
  }

  // Métodos de gestión del servicio
  stopAll() {
    for (const [name, job] of this.jobs) {
      job.stop();
      console.log(`Stopped job: ${name}`);
    }
    this.jobs.clear();
  }

  stopJob(jobId) {
    const job = this.jobs.get(jobId);
    if (job) {
      job.stop();
      this.jobs.delete(jobId);
      console.log(`Stopped job: ${jobId}`);
    }
  }

  restartJob(jobId) {
    this.stopJob(jobId);
    const automation = await Automation.findByPk(jobId);
    if (automation) {
      this.scheduleAutomation(automation);
    }
  }
}

module.exports = new CronService();
