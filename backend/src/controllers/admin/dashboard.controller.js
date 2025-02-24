const { User, Artist, Cause, Donation, AutomationLog } = require('../../models');
const { Op } = require('sequelize');
const catchAsync = require('../../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res) => {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const [
        totalUsers,
        newUsers,
        totalArtists,
        verifiedArtists,
        totalCauses,
        activeCauses,
        todayDonations,
        recentActivities
    ] = await Promise.all([
        User.count(),
        User.count({
            where: {
                createdAt: {
                    [Op.between]: [startOfDay, endOfDay]
                }
            }
        }),
        Artist.count(),
        Artist.count({ where: { isVerified: true } }),
        Cause.count(),
        Cause.count({ where: { status: 'active' } }),
        Donation.sum('amount', {
            where: {
                createdAt: {
                    [Op.between]: [startOfDay, endOfDay]
                },
                status: 'completed'
            }
        }),
        AutomationLog.findAll({
            limit: 10,
            order: [['createdAt', 'DESC']],
            include: [{
                model: User,
                attributes: ['name', 'email']
            }]
        })
    ]);

    res.json({
        status: 200,
        message: 'Dashboard overview data retrieved successfully',
        data: {
            users: {
                total: totalUsers,
                new: newUsers
            },
            artists: {
                total: totalArtists,
                verified: verifiedArtists
            },
            causes: {
                total: totalCauses,
                active: activeCauses
            },
            donations: {
                today: todayDonations || 0
            },
            recentActivities
        }
    });
});

exports.getStatistics = catchAsync(async (req, res) => {
    const { period = 'week' } = req.query;
    let startDate, endDate = new Date();

    switch (period) {
        case 'day':
            startDate = new Date(endDate.getTime() - (24 * 60 * 60 * 1000));
            break;
        case 'week':
            startDate = new Date(endDate.getTime() - (7 * 24 * 60 * 60 * 1000));
            break;
        case 'month':
            startDate = new Date(endDate.getTime() - (30 * 24 * 60 * 60 * 1000));
            break;
        default:
            startDate = new Date(endDate.getTime() - (7 * 24 * 60 * 60 * 1000));
    }

    const [donations, newUsers, newCauses] = await Promise.all([
        Donation.findAll({
            where: {
                createdAt: {
                    [Op.between]: [startDate, endDate]
                },
                status: 'completed'
            },
            attributes: [
                [sequelize.fn('date_trunc', 'day', sequelize.col('createdAt')), 'date'],
                [sequelize.fn('sum', sequelize.col('amount')), 'total']
            ],
            group: [sequelize.fn('date_trunc', 'day', sequelize.col('createdAt'))],
            order: [[sequelize.fn('date_trunc', 'day', sequelize.col('createdAt')), 'ASC']]
        }),
        User.findAll({
            where: {
                createdAt: {
                    [Op.between]: [startDate, endDate]
                }
            },
            attributes: [
                [sequelize.fn('date_trunc', 'day', sequelize.col('createdAt')), 'date'],
                [sequelize.fn('count', '*'), 'count']
            ],
            group: [sequelize.fn('date_trunc', 'day', sequelize.col('createdAt'))],
            order: [[sequelize.fn('date_trunc', 'day', sequelize.col('createdAt')), 'ASC']]
        }),
        Cause.findAll({
            where: {
                createdAt: {
                    [Op.between]: [startDate, endDate]
                }
            },
            attributes: [
                [sequelize.fn('date_trunc', 'day', sequelize.col('createdAt')), 'date'],
                [sequelize.fn('count', '*'), 'count']
            ],
            group: [sequelize.fn('date_trunc', 'day', sequelize.col('createdAt'))],
            order: [[sequelize.fn('date_trunc', 'day', sequelize.col('createdAt')), 'ASC']]
        })
    ]);

    res.json({
        status: 200,
        message: 'Statistics retrieved successfully',
        data: {
            donations,
            newUsers,
            newCauses,
            period
        }
    });
});

exports.getSystemHealth = catchAsync(async (req, res) => {
    const [
        failedAutomations,
        pendingVerifications,
        systemAlerts
    ] = await Promise.all([
        AutomationLog.count({
            where: {
                status: 'failed',
                createdAt: {
                    [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000)
                }
            }
        }),
        Artist.count({
            where: {
                isVerified: false,
                status: 'pending'
            }
        }),
        SystemAlert.findAll({
            where: {
                status: 'active'
            },
            limit: 5,
            order: [['createdAt', 'DESC']]
        })
    ]);

    res.json({
        status: 200,
        message: 'System health data retrieved successfully',
        data: {
            automationHealth: {
                failedTasks: failedAutomations
            },
            pendingTasks: {
                artistVerifications: pendingVerifications
            },
            activeAlerts: systemAlerts
        }
    });
});
