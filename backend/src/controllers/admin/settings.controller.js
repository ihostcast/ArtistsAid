const fs = require('fs').promises;
const path = require('path');
const { Setting } = require('../../models');
const catchAsync = require('../../utils/catchAsync');
const { validateSettingValue } = require('../../utils/validators');

exports.getSettings = catchAsync(async (req, res) => {
    const settings = await Setting.findAll({
        order: [['category', 'ASC'], ['key', 'ASC']]
    });

    const groupedSettings = settings.reduce((acc, setting) => {
        if (!acc[setting.category]) {
            acc[setting.category] = [];
        }
        acc[setting.category].push(setting);
        return acc;
    }, {});

    res.json({
        status: 200,
        message: 'Settings retrieved successfully',
        data: groupedSettings
    });
});

exports.updateSettings = catchAsync(async (req, res) => {
    const { settings } = req.body;

    if (!Array.isArray(settings)) {
        return res.status(400).json({
            status: 400,
            message: 'Settings must be an array'
        });
    }

    const results = await Promise.all(settings.map(async (setting) => {
        const { key, value } = setting;

        // Validate setting value
        const isValid = await validateSettingValue(key, value);
        if (!isValid) {
            return {
                key,
                success: false,
                message: 'Invalid value for setting'
            };
        }

        const [updatedSetting] = await Setting.update(
            { value },
            { 
                where: { key },
                returning: true
            }
        );

        return {
            key,
            success: !!updatedSetting,
            message: updatedSetting ? 'Setting updated successfully' : 'Setting not found'
        };
    }));

    res.json({
        status: 200,
        message: 'Settings updated',
        data: results
    });
});

exports.getConfigFiles = catchAsync(async (req, res) => {
    const configPath = path.join(__dirname, '../../config');
    const files = await fs.readdir(configPath);
    
    const configFiles = await Promise.all(files
        .filter(file => file.endsWith('.json'))
        .map(async file => {
            const stats = await fs.stat(path.join(configPath, file));
            return {
                name: file,
                size: stats.size,
                lastModified: stats.mtime
            };
        }));

    res.json({
        status: 200,
        message: 'Configuration files retrieved successfully',
        data: configFiles
    });
});

exports.getConfigFile = catchAsync(async (req, res) => {
    const { filename } = req.params;
    
    if (!filename.endsWith('.json')) {
        return res.status(400).json({
            status: 400,
            message: 'Only JSON configuration files can be viewed'
        });
    }

    const filePath = path.join(__dirname, '../../config', filename);
    
    try {
        const content = await fs.readFile(filePath, 'utf8');
        const config = JSON.parse(content);

        res.json({
            status: 200,
            message: 'Configuration file content retrieved successfully',
            data: config
        });
    } catch (error) {
        if (error.code === 'ENOENT') {
            return res.status(404).json({
                status: 404,
                message: 'Configuration file not found'
            });
        }
        throw error;
    }
});

exports.updateConfigFile = catchAsync(async (req, res) => {
    const { filename } = req.params;
    const { content } = req.body;

    if (!filename.endsWith('.json')) {
        return res.status(400).json({
            status: 400,
            message: 'Only JSON configuration files can be updated'
        });
    }

    const filePath = path.join(__dirname, '../../config', filename);

    try {
        // Validate JSON content
        JSON.parse(JSON.stringify(content));

        // Create backup
        const backupPath = path.join(__dirname, '../../config/backups', `${filename}.${Date.now()}.bak`);
        await fs.mkdir(path.dirname(backupPath), { recursive: true });
        await fs.copyFile(filePath, backupPath);

        // Write new content
        await fs.writeFile(filePath, JSON.stringify(content, null, 2));

        res.json({
            status: 200,
            message: 'Configuration file updated successfully'
        });
    } catch (error) {
        if (error.code === 'ENOENT') {
            return res.status(404).json({
                status: 404,
                message: 'Configuration file not found'
            });
        }
        if (error instanceof SyntaxError) {
            return res.status(400).json({
                status: 400,
                message: 'Invalid JSON content'
            });
        }
        throw error;
    }
});

exports.getSystemInfo = catchAsync(async (req, res) => {
    const systemInfo = {
        node: process.version,
        platform: process.platform,
        arch: process.arch,
        memory: {
            total: process.memoryUsage().heapTotal,
            used: process.memoryUsage().heapUsed,
            external: process.memoryUsage().external
        },
        uptime: process.uptime(),
        env: process.env.NODE_ENV,
        pid: process.pid
    };

    res.json({
        status: 200,
        message: 'System information retrieved successfully',
        data: systemInfo
    });
});
