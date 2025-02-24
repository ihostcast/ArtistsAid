const { Provider, Service } = require('../../models');
const catchAsync = require('../../utils/catchAsync');
const NotificationService = require('../../services/NotificationService');

exports.createProvider = catchAsync(async (req, res) => {
    const partnerId = req.user.id;
    const providerData = {
        ...req.body,
        partnerId,
        status: 'active',
        verification_status: 'unverified'
    };

    const provider = await Provider.create(providerData);

    // Enviar email de bienvenida y verificación
    await NotificationService.sendVerificationEmail(provider.id);

    res.status(201).json({
        success: true,
        data: provider
    });
});

exports.getProviders = catchAsync(async (req, res) => {
    const partnerId = req.user.id;
    const { status, search, page = 1, limit = 10 } = req.query;

    const whereClause = { partnerId };
    if (status) {
        whereClause.status = status;
    }
    if (search) {
        whereClause[Op.or] = [
            { name: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } }
        ];
    }

    const providers = await Provider.findAndCountAll({
        where: whereClause,
        include: [{
            model: Service,
            as: 'services',
            through: { attributes: [] }
        }],
        offset: (page - 1) * limit,
        limit: parseInt(limit),
        order: [['createdAt', 'DESC']]
    });

    res.json({
        success: true,
        data: {
            providers: providers.rows,
            pagination: {
                total: providers.count,
                pages: Math.ceil(providers.count / limit),
                currentPage: parseInt(page),
                limit: parseInt(limit)
            }
        }
    });
});

exports.getProvider = catchAsync(async (req, res) => {
    const { id } = req.params;
    const partnerId = req.user.id;

    const provider = await Provider.findOne({
        where: { id, partnerId },
        include: [{
            model: Service,
            as: 'services',
            through: { attributes: ['customPrice'] }
        }]
    });

    if (!provider) {
        return res.status(404).json({
            success: false,
            message: 'Provider not found'
        });
    }

    res.json({
        success: true,
        data: provider
    });
});

exports.updateProvider = catchAsync(async (req, res) => {
    const { id } = req.params;
    const partnerId = req.user.id;
    const updateData = req.body;

    // Asegurarse de que no se puedan modificar campos sensibles
    delete updateData.partnerId;
    delete updateData.password;
    delete updateData.verification_status;

    const [updated] = await Provider.update(updateData, {
        where: { id, partnerId }
    });

    if (!updated) {
        return res.status(404).json({
            success: false,
            message: 'Provider not found'
        });
    }

    const provider = await Provider.findOne({
        where: { id, partnerId },
        include: [{
            model: Service,
            as: 'services',
            through: { attributes: ['customPrice'] }
        }]
    });

    res.json({
        success: true,
        data: provider
    });
});

exports.deleteProvider = catchAsync(async (req, res) => {
    const { id } = req.params;
    const partnerId = req.user.id;

    const deleted = await Provider.destroy({
        where: { id, partnerId }
    });

    if (!deleted) {
        return res.status(404).json({
            success: false,
            message: 'Provider not found'
        });
    }

    res.json({
        success: true,
        message: 'Provider deleted successfully'
    });
});

exports.assignServices = catchAsync(async (req, res) => {
    const { id } = req.params;
    const partnerId = req.user.id;
    const { services } = req.body;

    const provider = await Provider.findOne({
        where: { id, partnerId }
    });

    if (!provider) {
        return res.status(404).json({
            success: false,
            message: 'Provider not found'
        });
    }

    // Verificar que todos los servicios pertenezcan al partner
    const serviceIds = services.map(s => s.id);
    const validServices = await Service.findAll({
        where: {
            id: serviceIds,
            partnerId
        }
    });

    if (validServices.length !== serviceIds.length) {
        return res.status(400).json({
            success: false,
            message: 'Some services are invalid or do not belong to you'
        });
    }

    // Actualizar asignaciones
    await provider.setServices(serviceIds);

    // Actualizar precios personalizados
    for (const service of services) {
        if (service.customPrice) {
            await provider.provider_services.update(
                { customPrice: service.customPrice },
                { where: { serviceId: service.id } }
            );
        }
    }

    const updatedProvider = await Provider.findOne({
        where: { id },
        include: [{
            model: Service,
            as: 'services',
            through: { attributes: ['customPrice'] }
        }]
    });

    res.json({
        success: true,
        data: updatedProvider
    });
});

exports.updateStatus = catchAsync(async (req, res) => {
    const { id } = req.params;
    const partnerId = req.user.id;
    const { status } = req.body;

    const [updated] = await Provider.update(
        { status },
        { where: { id, partnerId } }
    );

    if (!updated) {
        return res.status(404).json({
            success: false,
            message: 'Provider not found'
        });
    }

    res.json({
        success: true,
        message: 'Provider status updated successfully'
    });
});
