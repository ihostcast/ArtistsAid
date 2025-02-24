const { Partner, Provider, Service } = require('../../models');
const { Op } = require('sequelize');
const catchAsync = require('../../utils/catchAsync');

exports.getDashboardStats = catchAsync(async (req, res) => {
    const partnerId = req.user.id;

    const [
        totalProviders,
        activeProviders,
        totalServices,
        providersStats,
        servicesStats
    ] = await Promise.all([
        // Total de providers
        Provider.count({ where: { partnerId } }),
        
        // Providers activos
        Provider.count({ 
            where: { 
                partnerId,
                status: 'active'
            }
        }),

        // Total de servicios
        Service.count({ where: { partnerId } }),

        // Estadísticas de providers
        Provider.findAll({
            where: { partnerId },
            attributes: [
                'status',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['status']
        }),

        // Estadísticas de servicios
        Service.findAll({
            where: { partnerId },
            attributes: [
                'category',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
                [sequelize.fn('AVG', sequelize.col('price')), 'avgPrice']
            ],
            group: ['category']
        })
    ]);

    // Obtener los últimos providers registrados
    const recentProviders = await Provider.findAll({
        where: { partnerId },
        order: [['createdAt', 'DESC']],
        limit: 5,
        attributes: ['id', 'name', 'email', 'status', 'createdAt']
    });

    // Obtener los servicios más populares
    const popularServices = await Service.findAll({
        where: { partnerId },
        include: [{
            model: Provider,
            as: 'providers',
            attributes: []
        }],
        attributes: [
            'id',
            'name',
            'price',
            [sequelize.fn('COUNT', sequelize.col('providers.id')), 'providerCount']
        ],
        group: ['Service.id'],
        order: [[sequelize.fn('COUNT', sequelize.col('providers.id')), 'DESC']],
        limit: 5
    });

    res.json({
        success: true,
        data: {
            overview: {
                totalProviders,
                activeProviders,
                totalServices,
                providerUtilization: (activeProviders / totalProviders * 100).toFixed(2)
            },
            providersStats: providersStats.reduce((acc, stat) => {
                acc[stat.status] = stat.count;
                return acc;
            }, {}),
            servicesStats: servicesStats.reduce((acc, stat) => {
                acc[stat.category] = {
                    count: stat.count,
                    avgPrice: parseFloat(stat.avgPrice).toFixed(2)
                };
                return acc;
            }, {}),
            recentProviders,
            popularServices
        }
    });
});

exports.getProviderStats = catchAsync(async (req, res) => {
    const partnerId = req.user.id;
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate && endDate) {
        dateFilter.createdAt = {
            [Op.between]: [new Date(startDate), new Date(endDate)]
        };
    }

    const providers = await Provider.findAll({
        where: {
            partnerId,
            ...dateFilter
        },
        attributes: [
            'id',
            'name',
            'status',
            'rating',
            'total_reviews',
            [
                sequelize.fn('COUNT', sequelize.col('services.id')),
                'totalServices'
            ]
        ],
        include: [{
            model: Service,
            as: 'services',
            attributes: []
        }],
        group: ['Provider.id'],
        order: [['rating', 'DESC']]
    });

    res.json({
        success: true,
        data: providers
    });
});

exports.getServiceStats = catchAsync(async (req, res) => {
    const partnerId = req.user.id;
    const { category } = req.query;

    const whereClause = { partnerId };
    if (category) {
        whereClause.category = category;
    }

    const services = await Service.findAll({
        where: whereClause,
        attributes: [
            'id',
            'name',
            'category',
            'price',
            'status',
            [
                sequelize.fn('COUNT', sequelize.col('providers.id')),
                'providerCount'
            ]
        ],
        include: [{
            model: Provider,
            as: 'providers',
            attributes: []
        }],
        group: ['Service.id'],
        order: [['price', 'DESC']]
    });

    const categories = await Service.findAll({
        where: { partnerId },
        attributes: [
            'category',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
            [sequelize.fn('AVG', sequelize.col('price')), 'avgPrice']
        ],
        group: ['category']
    });

    res.json({
        success: true,
        data: {
            services,
            categories: categories.map(cat => ({
                name: cat.category,
                count: cat.count,
                avgPrice: parseFloat(cat.avgPrice).toFixed(2)
            }))
        }
    });
});
