/**
 * Wrapper para manejar errores asíncronos en controladores
 * @param {Function} fn - Función asíncrona a envolver
 * @returns {Function} Middleware con manejo de errores
 */
exports.catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
