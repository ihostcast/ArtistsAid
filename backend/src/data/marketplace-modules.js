const baseModules = [
  {
    id: 'stripe-gateway',
    name: 'Stripe Payment Gateway',
    type: 'gateway',
    version: '1.2.0',
    author: 'ArtistsAid',
    description: 'Procesamiento de pagos seguro con Stripe, incluyendo pagos recurrentes y gestión de suscripciones.',
    preview: '/modules/stripe-preview.jpg',
    rating: 4.8,
    downloads: 1250,
    targetAudience: [],
    requiredRoles: []
  },
  {
    id: 'paypal-gateway',
    name: 'PayPal Pro',
    type: 'gateway',
    version: '2.0.1',
    author: 'ArtistsAid',
    description: 'Integración completa con PayPal, incluyendo PayPal Express y pagos con tarjeta.',
    preview: '/modules/paypal-preview.jpg',
    rating: 4.6,
    downloads: 980,
    targetAudience: [],
    requiredRoles: []
  },
  {
    id: 'mailchimp-integration',
    name: 'Mailchimp Integration',
    type: 'integration',
    version: '1.0.5',
    author: 'ArtistsAid',
    description: 'Sincroniza usuarios y gestiona campañas de email marketing con Mailchimp.',
    preview: '/modules/mailchimp-preview.jpg',
    rating: 4.5,
    downloads: 750,
    targetAudience: [],
    requiredRoles: []
  },
  {
    id: 'google-analytics',
    name: 'Google Analytics Enhanced',
    type: 'addon',
    version: '1.1.0',
    author: 'ArtistsAid',
    description: 'Seguimiento avanzado de usuarios y conversiones con Google Analytics 4.',
    preview: '/modules/analytics-preview.jpg',
    rating: 4.7,
    downloads: 2100,
    targetAudience: [],
    requiredRoles: []
  },
  {
    id: 'security-suite',
    name: 'Security Suite Pro',
    type: 'security',
    version: '2.1.0',
    author: 'ArtistsAid',
    description: 'Suite completa de seguridad con firewall, anti-spam y protección contra fraudes.',
    preview: '/modules/security-preview.jpg',
    rating: 4.9,
    downloads: 1500,
    targetAudience: [],
    requiredRoles: []
  },
  {
    id: 'advanced-reports',
    name: 'Advanced Reports & Analytics',
    type: 'report',
    version: '1.3.0',
    author: 'ArtistsAid',
    description: 'Informes detallados y análisis avanzado de datos para tu negocio.',
    preview: '/modules/reports-preview.jpg',
    rating: 4.7,
    downloads: 890,
    targetAudience: [],
    requiredRoles: []
  },
  {
    id: 'spotify-integration',
    name: 'Spotify Artist Hub',
    type: 'streaming',
    version: '1.0.0',
    author: 'ArtistsAid',
    description: 'Integración completa con Spotify para artistas. Gestiona tu perfil, analiza estadísticas y promociona tu música.',
    preview: '/modules/spotify-preview.jpg',
    rating: 4.8,
    downloads: 850,
    targetAudience: ['musicians', 'bands'],
    requiredRoles: []
  },
  {
    id: 'youtube-music-suite',
    name: 'YouTube Music Pro Suite',
    type: 'streaming',
    version: '1.1.0',
    author: 'ArtistsAid',
    description: 'Suite completa para gestionar tu presencia en YouTube Music y YouTube.',
    preview: '/modules/youtube-music-preview.jpg',
    rating: 4.7,
    downloads: 620,
    targetAudience: [],
    requiredRoles: []
  },
  {
    id: 'photo-portfolio-pro',
    name: 'Photography Portfolio Pro',
    type: 'photography',
    version: '2.0.0',
    author: 'ArtistsAid',
    description: 'Crea un impresionante portfolio fotográfico con galerías personalizadas y ventas integradas.',
    preview: '/modules/photo-portfolio-preview.jpg',
    rating: 4.9,
    downloads: 1200,
    targetAudience: [],
    requiredRoles: []
  },
  {
    id: 'journalist-toolkit',
    name: 'Journalist Toolkit',
    type: 'journalism',
    version: '1.5.0',
    author: 'ArtistsAid',
    description: 'Herramientas esenciales para periodistas digitales.',
    preview: '/modules/journalist-preview.jpg',
    rating: 4.8,
    downloads: 450,
    targetAudience: [],
    requiredRoles: []
  },
  {
    id: 'artisan-marketplace',
    name: 'Artisan Marketplace',
    type: 'artisan',
    version: '1.2.0',
    author: 'ArtistsAid',
    description: 'Crea tu propia tienda de artesanías con herramientas especializadas.',
    preview: '/modules/artisan-preview.jpg',
    rating: 4.6,
    downloads: 780,
    targetAudience: [],
    requiredRoles: []
  },
  {
    id: 'event-manager-pro',
    name: 'Event Manager Pro',
    type: 'entertainment',
    version: '2.1.0',
    author: 'ArtistsAid',
    description: 'Gestión completa de eventos y shows en vivo.',
    preview: '/modules/event-manager-preview.jpg',
    rating: 4.7,
    downloads: 920,
    targetAudience: [],
    requiredRoles: []
  },
  {
    id: 'social-media-hub',
    name: 'Social Media Hub',
    type: 'social',
    version: '1.3.0',
    author: 'ArtistsAid',
    description: 'Gestiona todas tus redes sociales desde un solo lugar.',
    preview: '/modules/social-hub-preview.jpg',
    rating: 4.5,
    downloads: 1500,
    targetAudience: [],
    requiredRoles: []
  },
  {
    id: 'amazon-music-connect',
    name: 'Amazon Music Connect',
    type: 'streaming',
    version: '1.0.0',
    author: 'ArtistsAid',
    description: 'Integración con Amazon Music para artistas y sellos discográficos.',
    preview: '/modules/amazon-music-preview.jpg',
    rating: 4.4,
    downloads: 340,
    targetAudience: [],
    requiredRoles: []
  },
  {
    id: 'cloud-music-distribution',
    name: 'Cloud Music Distribution',
    type: 'music',
    version: '1.1.0',
    author: 'ArtistsAid',
    description: 'Distribuye tu música en todas las plataformas principales.',
    preview: '/modules/distribution-preview.jpg',
    rating: 4.8,
    downloads: 670,
    targetAudience: [],
    requiredRoles: []
  },
  {
    id: 'basic-portfolio',
    name: 'Basic Portfolio',
    type: 'portfolio',
    version: '1.0.0',
    author: 'ArtistsAid',
    description: 'Portfolio básico para mostrar tu trabajo artístico.',
    isBase: true,
    preview: '/modules/basic-portfolio-preview.jpg',
    rating: 4.5,
    downloads: 5000,
    targetAudience: [],
    requiredRoles: []
  },
  {
    id: 'basic-promotion',
    name: 'Basic Promotion Tools',
    type: 'promotion',
    version: '1.0.0',
    isBase: true,
    author: 'ArtistsAid',
    description: 'Herramientas básicas de promoción para artistas.',
    preview: '/modules/basic-promotion-preview.jpg',
    rating: 4.4,
    downloads: 4200,
    targetAudience: [],
    requiredRoles: []
  },
  {
    id: 'ai-content-creator',
    name: 'AI Content Creator Pro',
    type: 'ai',
    version: '2.0.0',
    author: 'ArtistsAid',
    description: 'Crea contenido único con IA para tu presencia artística.',
    preview: '/modules/ai-content-creator-preview.jpg',
    rating: 4.9,
    downloads: 1800,
    targetAudience: [],
    requiredRoles: []
  },
  {
    id: 'smart-booking',
    name: 'Smart Booking System',
    type: 'booking',
    version: '1.5.0',
    author: 'ArtistsAid',
    description: 'Sistema inteligente de reservas y agenda para artistas.',
    preview: '/modules/smart-booking-preview.jpg',
    rating: 4.8,
    downloads: 920,
    targetAudience: [],
    requiredRoles: []
  },
  {
    id: 'contract-master',
    name: 'Contract Master',
    type: 'contract',
    version: '2.1.0',
    author: 'ArtistsAid',
    description: 'Gestión profesional de contratos artísticos con plantillas legales.',
    preview: '/modules/contract-master-preview.jpg',
    rating: 4.7,
    downloads: 650,
    targetAudience: [],
    requiredRoles: []
  },
  {
    id: 'ai-performance-analytics',
    name: 'AI Performance Analytics',
    type: 'analytics',
    version: '1.0.0',
    author: 'ArtistsAid',
    description: 'Análisis avanzado de rendimiento artístico con IA.',
    preview: '/modules/ai-analytics-preview.jpg',
    rating: 4.8,
    downloads: 420,
    targetAudience: [],
    requiredRoles: []
  },
  {
    id: 'promotion-suite',
    name: 'Professional Promotion Suite',
    type: 'promotion',
    version: '2.0.0',
    author: 'ArtistsAid',
    description: 'Suite completa de herramientas promocionales para artistas.',
    preview: '/modules/promo-suite-preview.jpg',
    rating: 4.9,
    downloads: 780,
    targetAudience: [],
    requiredRoles: []
  },
  {
    id: 'artist-crm',
    name: 'Artist CRM Pro',
    type: 'addon',
    version: '1.5.0',
    author: 'ArtistsAid',
    description: 'Sistema CRM especializado para artistas y gestión de fans.',
    preview: '/modules/crm-preview.jpg',
    rating: 4.7,
    downloads: 890,
    targetAudience: [],
    requiredRoles: []
  }
];

// Procesar los módulos para el formato correcto
module.exports = baseModules.map(module => {
  const processedModule = {
    id: module.id,
    name: module.name,
    type: module.type,
    version: module.version,
    author: module.author,
    description: module.description,
    config: JSON.stringify({}),
    systemRequirements: JSON.stringify({}),
    dependencies: JSON.stringify(['core']),
    targetAudience: JSON.stringify(module.targetAudience || ['all']),
    requiredRoles: JSON.stringify(['user']),
    pricing: JSON.stringify({
      type: module.pricing?.type || 'one-time',
      price: module.pricing?.price || module.price || 0,
      currency: 'USD',
      interval: module.pricing?.interval || null,
      trialDays: module.pricing?.trialDays || 0
    })
  };
  
  return processedModule;
});
