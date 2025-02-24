const Post = require('../models/Post');
const User = require('../models/User');
const Like = require('../models/Like');
const { checkPermissions } = require('../middleware/auth');

exports.createPost = async (req, res) => {
  try {
    checkPermissions(req.user, ['contributor', 'editor', 'admin']);
    
    const post = await Post.create({
      ...req.body,
      authorId: req.user.id
    });

    res.status(201).json({
      success: true,
      data: post
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, tag } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};
    if (tag) {
      where.tags = {
        [Op.contains]: [tag]
      };
    }

    const posts = await Post.findAndCountAll({
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
      data: posts.rows,
      pagination: {
        total: posts.count,
        pages: Math.ceil(posts.count / limit),
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

exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id, {
      include: [{
        model: User,
        attributes: ['id', 'firstName', 'lastName']
      }]
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Incrementar vistas
    post.views += 1;
    await post.save();

    // Obtener likes si el usuario está autenticado
    let liked = false;
    if (req.user) {
      const like = await Like.findOne({
        where: {
          postId: post.id,
          userId: req.user.id
        }
      });
      liked = !!like;
    }

    const likesCount = await Like.count({
      where: { postId: post.id }
    });

    res.json({
      success: true,
      data: {
        ...post.toJSON(),
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

exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Solo el autor o admin/editor puede editar
    if (post.authorId !== req.user.id && !['admin', 'editor'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized'
      });
    }

    await post.update(req.body);

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Solo el autor o admin puede eliminar
    if (post.authorId !== req.user.id && !['admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized'
      });
    }

    await post.destroy();

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
    const post = await Post.findByPk(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    const existingLike = await Like.findOne({
      where: {
        postId: post.id,
        userId: req.user.id
      }
    });

    if (existingLike) {
      await existingLike.destroy();
    } else {
      await Like.create({
        postId: post.id,
        userId: req.user.id
      });
    }

    const likesCount = await Like.count({
      where: { postId: post.id }
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
