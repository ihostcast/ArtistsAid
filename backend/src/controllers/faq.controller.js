const FAQ = require('../models/FAQ');
const { checkPermissions } = require('../middleware/auth');

exports.createFAQ = async (req, res) => {
  try {
    checkPermissions(req.user, ['admin']);
    
    const faq = await FAQ.create(req.body);

    res.status(201).json({
      success: true,
      data: faq
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

exports.getAllFAQs = async (req, res) => {
  try {
    const { category } = req.query;
    
    const where = {};
    if (category) where.category = category;

    const faqs = await FAQ.findAll({
      where,
      order: [
        ['category', 'ASC'],
        ['order', 'ASC']
      ]
    });

    res.json({
      success: true,
      data: faqs
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

exports.updateFAQ = async (req, res) => {
  try {
    checkPermissions(req.user, ['admin']);

    const faq = await FAQ.findByPk(req.params.id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        error: 'FAQ not found'
      });
    }

    await faq.update(req.body);

    res.json({
      success: true,
      data: faq
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

exports.deleteFAQ = async (req, res) => {
  try {
    checkPermissions(req.user, ['admin']);

    const faq = await FAQ.findByPk(req.params.id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        error: 'FAQ not found'
      });
    }

    await faq.destroy();

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

exports.reorderFAQs = async (req, res) => {
  try {
    checkPermissions(req.user, ['admin']);

    const { orders } = req.body;

    // Validar el formato del array de órdenes
    if (!Array.isArray(orders) || !orders.every(o => o.id && typeof o.order === 'number')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid order format'
      });
    }

    // Actualizar el orden de cada FAQ
    await Promise.all(
      orders.map(({ id, order }) =>
        FAQ.update({ order }, { where: { id } })
      )
    );

    const updatedFAQs = await FAQ.findAll({
      order: [
        ['category', 'ASC'],
        ['order', 'ASC']
      ]
    });

    res.json({
      success: true,
      data: updatedFAQs
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};
