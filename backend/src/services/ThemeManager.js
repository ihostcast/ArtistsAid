const fs = require('fs-extra');
const path = require('path');
const { Theme } = require('../models');

class ThemeManager {
  constructor() {
    this.themesDir = path.join(process.cwd(), 'themes');
    this.frontendDir = path.join(this.themesDir, 'frontend');
    this.dashboardDir = path.join(this.themesDir, 'dashboard');
  }

  async initialize() {
    // Crear directorios si no existen
    await fs.ensureDir(this.frontendDir);
    await fs.ensureDir(this.dashboardDir);
  }

  async installTheme(themeFile, type) {
    try {
      const themeDir = type === 'frontend' ? this.frontendDir : this.dashboardDir;
      
      // Extraer el tema y validar estructura
      const themePath = await this.extractTheme(themeFile, themeDir);
      const themeConfig = await this.validateTheme(themePath);

      // Registrar en la base de datos
      const theme = await Theme.create({
        name: themeConfig.name,
        type,
        version: themeConfig.version,
        directory: themePath,
        author: themeConfig.author,
        description: themeConfig.description,
        config: themeConfig.config || {},
        settings: themeConfig.settings || {}
      });

      return theme;
    } catch (error) {
      throw new Error(`Error instalando tema: ${error.message}`);
    }
  }

  async activateTheme(themeId) {
    const theme = await Theme.findByPk(themeId);
    if (!theme) throw new Error('Tema no encontrado');

    // Desactivar tema actual del mismo tipo
    await Theme.update(
      { isActive: false },
      { where: { type: theme.type, isActive: true } }
    );

    // Activar nuevo tema
    theme.isActive = true;
    await theme.save();

    // Aplicar configuración del tema
    await this.applyThemeConfig(theme);
  }

  async getActiveTheme(type) {
    return await Theme.findOne({
      where: { type, isActive: true }
    });
  }

  async listThemes(type) {
    return await Theme.findAll({
      where: { type }
    });
  }

  async updateThemeSettings(themeId, settings) {
    const theme = await Theme.findByPk(themeId);
    if (!theme) throw new Error('Tema no encontrado');

    theme.settings = { ...theme.settings, ...settings };
    await theme.save();

    if (theme.isActive) {
      await this.applyThemeConfig(theme);
    }
  }

  // Métodos privados de utilidad
  async extractTheme(themeFile, targetDir) {
    // Implementar extracción de archivo zip
  }

  async validateTheme(themePath) {
    // Validar estructura y configuración del tema
  }

  async applyThemeConfig(theme) {
    // Aplicar configuración del tema activo
  }
}

module.exports = new ThemeManager();
