const ThemeManager = require('../services/ThemeManager');
const { catchAsync } = require('../utils/catchAsync');

exports.installTheme = catchAsync(async (req, res) => {
  const { type } = req.body;
  const themeFile = req.files.theme;

  const theme = await ThemeManager.installTheme(themeFile, type);
  res.status(201).json({
    status: 'success',
    data: { theme }
  });
});

exports.activateTheme = catchAsync(async (req, res) => {
  const { themeId } = req.params;

  await ThemeManager.activateTheme(themeId);
  res.status(200).json({
    status: 'success',
    message: 'Tema activado correctamente'
  });
});

exports.listThemes = catchAsync(async (req, res) => {
  const { type } = req.query;

  const themes = await ThemeManager.listThemes(type);
  res.status(200).json({
    status: 'success',
    data: { themes }
  });
});

exports.updateThemeSettings = catchAsync(async (req, res) => {
  const { themeId } = req.params;
  const { settings } = req.body;

  await ThemeManager.updateThemeSettings(themeId, settings);
  res.status(200).json({
    status: 'success',
    message: 'Configuración actualizada correctamente'
  });
});
