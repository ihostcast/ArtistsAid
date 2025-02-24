const News = require('../models/News');
const User = require('../models/User');
const Like = require('../models/Like');
const { checkPermissions } = require('../middleware/auth');

exports.createNews = async (req, res) => {
  try {
    checkPermissions(req.user, ['editor', 'admin']);
    
    const news = await News.create({
      ...req.body,
      authorId: req.user.id
    });

    res.status(201).json({
      success: true,
      data: news
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

exports.getAllNews = async (req, res) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};
    if (category) where.category = category;

    const news = await News.findAndCountAll({
      where,
      include: [{
        model: User,
        attributes: ['id', 'firstName', 'lastName']
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: news.rows,
      pagination: {
        total: news.count,
        pages: Math.ceil(news.count / limit),
        currentPage: parseInt(page)
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

exports.getNewsById = async (req, res) => {
  try {
    const news = await News.findByPk(req.params.id, {
      include: [{
        model: User,
        attributes: ['id', 'firstName', 'lastName']
      }]
    });

    if (!news) {
      return res.status(404).json({
        success: false,
        error: 'News not found'
      });
    }

    // Incrementar vistas
    news.views += 1;
    await news.save();

    // Obtener likes si el usuario está autenticado
    let liked = false;
    if (req.user) {
      const like = await Like.findOne({
        where: {
          newsId: news.id,
          userId: req.user.id
        }
      });
      liked = !!like;
    }

    const likesCount = await Like.count({
      where: { newsId: news.id }
    });

    res.json({
      success: true,
      data: {
        ...news.toJSON(),
        liked,
        likesCount
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

exports.updateNews = async (req, res) => {
  try {
    const news = await News.findByPk(req.params.id);

    if (!news) {
      return res.status(404).json({
        success: false,
        error: 'News not found'
      });
    }

    // Solo el autor o admin/editor puede editar
    if (news.authorId !== req.user.id && !['admin', 'editor'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized'
      });
    }

    await news.update(req.body);

    res.json({
      success: true,
      data: news
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

exports.deleteNews = async (req, res) => {
  try {
    const news = await News.findByPk(req.params.id);

    if (!news) {
      return res.status(404).json({
        success: false,
        error: 'News not found'
      });
    }

    // Solo admin puede eliminar
    checkPermissions(req.user, ['admin']);

    await news.destroy();

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

exports.toggleLike = async (req, res) => {
  try {
    const news = await News.findByPk(req.params.id);

    if (!news) {
      return res.status(404).json({
        success: false,
        error: 'News not found'
      });
    }

    const existingLike = await Like.findOne({
      where: {
        newsId: news.id,
        userId: req.user.id
      }
    });

    if (existingLike) {
      await existingLike.destroy();
    } else {
      await Like.create({
        newsId: news.id,
        userId: req.user.id
      });
    }

    const likesCount = await Like.count({
      where: { newsId: news.id }
    });

    res.json({
      success: true,
      data: {
        liked: !existingLike,
        likesCount
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};
