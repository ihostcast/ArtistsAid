const addons = {
    // Módulo de Marketing y SEO
    marketing: {
        name: 'Marketing Suite',
        description: 'Herramientas avanzadas de marketing y SEO',
        price: {
            monthly: 19.99,
            annual: 199.99
        },
        features: {
            seoTools: true,
            socialMediaIntegration: true,
            emailMarketing: true,
            analyticsAdvanced: true,
            marketingAutomation: true
        },
        compatibility: ['artist', 'broadcaster', 'journalist', 'photographer']
    },

    // Módulo de Colaboración
    collaboration: {
        name: 'Collaboration Tools',
        description: 'Herramientas para trabajo en equipo y colaboración',
        price: {
            monthly: 14.99,
            annual: 149.99
        },
        features: {
            teamChat: true,
            projectManagement: true,
            fileSharing: true,
            taskTracking: true,
            calendarSync: true
        },
        compatibility: ['artist', 'broadcaster', 'journalist', 'photographer']
    },

    // Módulo de Análisis Avanzado
    analytics: {
        name: 'Advanced Analytics',
        description: 'Análisis detallado y reportes personalizados',
        price: {
            monthly: 24.99,
            annual: 249.99
        },
        features: {
            customReports: true,
            audienceInsights: true,
            revenueTracking: true,
            predictiveAnalytics: true,
            exportTools: true
        },
        compatibility: ['artist', 'broadcaster', 'journalist', 'photographer']
    },

    // Módulo de E-Commerce
    ecommerce: {
        name: 'E-Commerce Suite',
        description: 'Tienda en línea y herramientas de venta',
        price: {
            monthly: 29.99,
            annual: 299.99
        },
        features: {
            onlineStore: true,
            digitalDownloads: true,
            inventoryManagement: true,
            shippingIntegration: true,
            multiplePaymentGateways: true
        },
        compatibility: ['artist', 'photographer']
    },

    // Módulo de Streaming Profesional
    streaming: {
        name: 'Professional Streaming',
        description: 'Herramientas avanzadas de streaming',
        price: {
            monthly: 39.99,
            annual: 399.99
        },
        features: {
            multiPlatformStreaming: true,
            customBranding: true,
            streamScheduling: true,
            chatModeration: true,
            streamAnalytics: true
        },
        compatibility: ['broadcaster', 'artist']
    },

    // Módulo de Gestión de Eventos
    events: {
        name: 'Event Management',
        description: 'Sistema completo de gestión de eventos',
        price: {
            monthly: 34.99,
            annual: 349.99
        },
        features: {
            ticketing: true,
            venueManagement: true,
            guestLists: true,
            eventPromotion: true,
            checkInApp: true
        },
        compatibility: ['artist', 'broadcaster']
    },

    // Módulo de Portafolio Premium
    portfolio: {
        name: 'Premium Portfolio',
        description: 'Herramientas avanzadas de portafolio',
        price: {
            monthly: 19.99,
            annual: 199.99
        },
        features: {
            customDomain: true,
            templates: true,
            clientProofing: true,
            watermarking: true,
            passwordProtection: true
        },
        compatibility: ['artist', 'photographer']
    }
};

// Configuración de bundles
const bundles = {
    artistPro: {
        name: 'Artist Pro Bundle',
        includes: ['marketing', 'collaboration', 'events'],
        discount: 0.20, // 20% de descuento sobre el precio regular
        compatibility: ['artist']
    },
    broadcasterPro: {
        name: 'Broadcaster Pro Bundle',
        includes: ['streaming', 'marketing', 'analytics'],
        discount: 0.20,
        compatibility: ['broadcaster']
    },
    photographerPro: {
        name: 'Photographer Pro Bundle',
        includes: ['portfolio', 'ecommerce', 'marketing'],
        discount: 0.20,
        compatibility: ['photographer']
    },
    journalistPro: {
        name: 'Journalist Pro Bundle',
        includes: ['analytics', 'collaboration', 'marketing'],
        discount: 0.20,
        compatibility: ['journalist']
    }
};

// Configuración de requisitos
const requirements = {
    marketing: {
        minPlan: 'professional',
        storage: '10GB',
        bandwidth: '100GB/month'
    },
    streaming: {
        minPlan: 'professional',
        bandwidth: '500GB/month',
        cpu: '2 cores'
    },
    ecommerce: {
        minPlan: 'professional',
        storage: '20GB',
        ssl: true
    }
};

// Configuración de límites
const limits = {
    marketing: {
        emailsPerMonth: 10000,
        campaigns: 5,
        automations: 3
    },
    streaming: {
        concurrent: 3,
        quality: '1080p',
        storage: '100GB'
    },
    ecommerce: {
        products: 1000,
        bandwidth: '200GB',
        transactions: 'unlimited'
    }
};

module.exports = {
    addons,
    bundles,
    requirements,
    limits
};
