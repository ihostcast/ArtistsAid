const domains = {
    main: process.env.MAIN_DOMAIN || 'https://artists-aid.vercel.app',
    admin: process.env.ADMIN_DOMAIN || 'https://artists-aid.vercel.app',
    adminSubdomain: process.env.ADMIN_SUBDOMAIN || 'https://admin.artists-aid.vercel.app',
    api: process.env.API_DOMAIN || 'https://artists-aid.vercel.app'
};

module.exports = domains;
