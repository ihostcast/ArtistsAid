const cron = require('node-cron');
const { Automation, AutomationLog } = require('../models');
const { Op } = require('sequelize');

class AutomationService {
  constructor() {
    this.scheduledJobs = new Map();
    this.initializeScheduler();
  }

  async initializeScheduler() {
    try {
      // Cargar todas las automatizaciones programadas activas
      const scheduledAutomations = await Automation.findAll({
        where: {
          type: 'schedule',
          isActive: true
        }
      });

      // Programar cada automatización
      scheduledAutomations.forEach(automation => {
        this.scheduleAutomation(automation);
      });

      // Configurar el monitor de eventos para automatizaciones basadas en triggers
      this.setupEventMonitor();
    } catch (error) {
      console.error('Error initializing automation scheduler:', error);
    }
  }

  scheduleAutomation(automation) {
    if (automation.type !== 'schedule' || !automation.config.cronExpression) {
      return;
    }

    // Cancelar el trabajo existente si existe
    if (this.scheduledJobs.has(automation.id)) {
      this.scheduledJobs.get(automation.id).stop();
    }

    // Crear nuevo trabajo programado
    const job = cron.schedule(automation.config.cronExpression, async () => {
      try {
        await this.executeAutomation(automation);
      } catch (error) {
        console.error(`Error executing scheduled automation ${automation.id}:`, error);
      }
    });

    // Almacenar el trabajo programado
    this.scheduledJobs.set(automation.id, job);
  }

  setupEventMonitor() {
    // Aquí configuramos los listeners para eventos del sistema
    // que pueden disparar automatizaciones basadas en triggers
    
    // Ejemplo: Monitorear cambios en módulos
    global.eventEmitter.on('moduleUpdated', async (moduleData) => {
      await this.handleTriggerEvent('moduleUpdated', moduleData);
    });

    // Ejemplo: Monitorear transacciones
    global.eventEmitter.on('transactionCompleted', async (transactionData) => {
      await this.handleTriggerEvent('transactionCompleted', transactionData);
    });
  }

  async handleTriggerEvent(eventName, eventData) {
    try {
      // Buscar automatizaciones que coincidan con el evento
      const triggerAutomations = await Automation.findAll({
        where: {
          type: 'trigger',
          isActive: true,
          config: {
            event: eventName
          }
        }
      });

      // Ejecutar cada automatización que coincida
      for (const automation of triggerAutomations) {
        if (this.evaluateConditions(automation.config.conditions, eventData)) {
          await this.executeAutomation(automation, eventData);
        }
      }
    } catch (error) {
      console.error(`Error handling trigger event ${eventName}:`, error);
    }
  }

  evaluateConditions(conditions, data) {
    // Implementar lógica de evaluación de condiciones
    // Similar a la lógica de reglas de WHMCS
    try {
      for (const condition of conditions) {
        const { field, operator, value } = condition;
        const fieldValue = this.getFieldValue(data, field);

        switch (operator) {
          case 'equals':
            if (fieldValue !== value) return false;
            break;
          case 'notEquals':
            if (fieldValue === value) return false;
            break;
          case 'contains':
            if (!fieldValue.includes(value)) return false;
            break;
          case 'greaterThan':
            if (fieldValue <= value) return false;
            break;
          case 'lessThan':
            if (fieldValue >= value) return false;
            break;
          // Agregar más operadores según sea necesario
        }
      }
      return true;
    } catch (error) {
      console.error('Error evaluating conditions:', error);
      return false;
    }
  }

  getFieldValue(obj, path) {
    return path.split('.').reduce((current, key) => current[key], obj);
  }

  async executeAutomation(automation, triggerData = {}) {
    const startTime = Date.now();
    let status = 'success';
    let error = null;
    let output = {};

    try {
      // Ejecutar cada acción en la configuración
      for (const action of automation.config.actions) {
        output = await this.executeAction(action, triggerData);
      }

      // Actualizar estadísticas de la automatización
      await this.updateAutomationStats(automation, true, Date.now() - startTime);
    } catch (err) {
      status = 'error';
      error = err.message;
      // Actualizar estadísticas de la automatización
      await this.updateAutomationStats(automation, false, Date.now() - startTime);
    }

    // Registrar el log de ejecución
    await AutomationLog.create({
      automationId: automation.id,
      status,
      executionTime: Date.now() - startTime,
      details: { actions: automation.config.actions },
      error,
      input: triggerData,
      output
    });
  }

  async executeAction(action, data) {
    switch (action.type) {
      case 'httpRequest':
        return await this.executeHttpRequest(action.config);
      case 'emailNotification':
        return await this.sendEmailNotification(action.config);
      case 'moduleFunction':
        return await this.executeModuleFunction(action.config);
      case 'updateRecord':
        return await this.updateDatabaseRecord(action.config);
      case 'createRecord':
        return await this.createDatabaseRecord(action.config);
      case 'webhook':
        return await this.triggerWebhook(action.config);
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  async updateAutomationStats(automation, success, executionTime) {
    const stats = automation.stats || {
      totalRuns: 0,
      successfulRuns: 0,
      failedRuns: 0,
      lastError: null,
      averageExecutionTime: 0
    };

    stats.totalRuns++;
    if (success) {
      stats.successfulRuns++;
    } else {
      stats.failedRuns++;
    }

    // Actualizar tiempo promedio de ejecución
    stats.averageExecutionTime = (
      (stats.averageExecutionTime * (stats.totalRuns - 1) + executionTime) /
      stats.totalRuns
    );

    await automation.update({
      stats,
      lastRun: new Date(),
      nextRun: this.calculateNextRun(automation)
    });
  }

  calculateNextRun(automation) {
    if (automation.type !== 'schedule' || !automation.config.cronExpression) {
      return null;
    }

    try {
      const interval = cron.parseExpression(automation.config.cronExpression);
      return interval.next().toDate();
    } catch (error) {
      console.error('Error calculating next run:', error);
      return null;
    }
  }

  // Implementación de los métodos de ejecución de acciones
  async executeHttpRequest(config) {
    // Implementar lógica para realizar solicitudes HTTP
  }

  async sendEmailNotification(config) {
    // Implementar lógica para enviar correos electrónicos
  }

  async executeModuleFunction(config) {
    // Implementar lógica para ejecutar funciones de módulos
  }

  async updateDatabaseRecord(config) {
    // Implementar lógica para actualizar registros en la base de datos
  }

  async createDatabaseRecord(config) {
    // Implementar lógica para crear registros en la base de datos
  }

  async triggerWebhook(config) {
    // Implementar lógica para disparar webhooks
  }
}

module.exports = new AutomationService();
