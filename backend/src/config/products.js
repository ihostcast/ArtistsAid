const products = {
    artist: {
        basic: {
            name: 'Artist Basic',
            price: {
                monthly: 9.99,
                quarterly: 26.99,
                annual: 99.99
            },
            features: {
                portfolio: {
                    storage: '5GB',
                    galleries: 10,
                    customDomain: false
                },
                events: {
                    monthly: 5,
                    ticketing: true,
                    promotion: 'basic'
                },
                support: {
                    response: '48h',
                    channels: ['email']
                }
            }
        },
        professional: {
            name: 'Artist Professional',
            price: {
                monthly: 29.99,
                quarterly: 79.99,
                annual: 299.99
            },
            features: {
                portfolio: {
                    storage: '20GB',
                    galleries: 'unlimited',
                    customDomain: true
                },
                events: {
                    monthly: 'unlimited',
                    ticketing: true,
                    promotion: 'premium'
                },
                support: {
                    response: '24h',
                    channels: ['email', 'phone', 'chat']
                }
            }
        },
        enterprise: {
            name: 'Artist Enterprise',
            price: 'custom',
            features: {
                portfolio: {
                    storage: 'unlimited',
                    galleries: 'unlimited',
                    customDomain: true
                },
                events: {
                    monthly: 'unlimited',
                    ticketing: true,
                    promotion: 'premium'
                },
                support: {
                    response: '4h',
                    channels: ['email', 'phone', 'chat', 'dedicated']
                }
            }
        }
    },
    broadcaster: {
        basic: {
            name: 'Broadcaster Basic',
            price: {
                monthly: 19.99,
                quarterly: 53.99,
                annual: 199.99
            },
            features: {
                streaming: {
                    hours: 100,
                    quality: '720p',
                    concurrent: 2
                },
                storage: {
                    recordings: '50GB',
                    retention: '30 days'
                },
                analytics: 'basic',
                support: {
                    response: '48h',
                    channels: ['email']
                }
            }
        },
        professional: {
            name: 'Broadcaster Professional',
            price: {
                monthly: 49.99,
                quarterly: 134.99,
                annual: 499.99
            },
            features: {
                streaming: {
                    hours: 500,
                    quality: '1080p',
                    concurrent: 5
                },
                storage: {
                    recordings: '200GB',
                    retention: '90 days'
                },
                analytics: 'advanced',
                support: {
                    response: '24h',
                    channels: ['email', 'phone', 'chat']
                }
            }
        },
        enterprise: {
            name: 'Broadcaster Enterprise',
            price: 'custom',
            features: {
                streaming: {
                    hours: 'unlimited',
                    quality: '4K',
                    concurrent: 'unlimited'
                },
                storage: {
                    recordings: 'unlimited',
                    retention: 'unlimited'
                },
                analytics: 'premium',
                support: {
                    response: '4h',
                    channels: ['email', 'phone', 'chat', 'dedicated']
                }
            }
        }
    },
    journalist: {
        basic: {
            name: 'Journalist Basic',
            price: {
                monthly: 14.99,
                quarterly: 40.99,
                annual: 149.99
            },
            features: {
                articles: {
                    monthly: 20,
                    storage: '10GB'
                },
                tools: {
                    research: true,
                    transcription: '2h/month'
                },
                distribution: 'basic',
                support: {
                    response: '48h',
                    channels: ['email']
                }
            }
        },
        professional: {
            name: 'Journalist Professional',
            price: {
                monthly: 39.99,
                quarterly: 107.99,
                annual: 399.99
            },
            features: {
                articles: {
                    monthly: 'unlimited',
                    storage: '50GB'
                },
                tools: {
                    research: true,
                    transcription: '10h/month'
                },
                distribution: 'premium',
                support: {
                    response: '24h',
                    channels: ['email', 'phone', 'chat']
                }
            }
        },
        enterprise: {
            name: 'Journalist Enterprise',
            price: 'custom',
            features: {
                articles: {
                    monthly: 'unlimited',
                    storage: 'unlimited'
                },
                tools: {
                    research: true,
                    transcription: 'unlimited'
                },
                distribution: 'enterprise',
                support: {
                    response: '4h',
                    channels: ['email', 'phone', 'chat', 'dedicated']
                }
            }
        }
    },
    photographer: {
        basic: {
            name: 'Photographer Basic',
            price: {
                monthly: 14.99,
                quarterly: 40.99,
                annual: 149.99
            },
            features: {
                storage: {
                    space: '20GB',
                    galleries: 15
                },
                tools: {
                    editing: 'basic',
                    delivery: true
                },
                clients: 10,
                support: {
                    response: '48h',
                    channels: ['email']
                }
            }
        },
        professional: {
            name: 'Photographer Professional',
            price: {
                monthly: 39.99,
                quarterly: 107.99,
                annual: 399.99
            },
            features: {
                storage: {
                    space: '100GB',
                    galleries: 'unlimited'
                },
                tools: {
                    editing: 'advanced',
                    delivery: true
                },
                clients: 'unlimited',
                support: {
                    response: '24h',
                    channels: ['email', 'phone', 'chat']
                }
            }
        },
        enterprise: {
            name: 'Photographer Enterprise',
            price: 'custom',
            features: {
                storage: {
                    space: 'unlimited',
                    galleries: 'unlimited'
                },
                tools: {
                    editing: 'premium',
                    delivery: true
                },
                clients: 'unlimited',
                support: {
                    response: '4h',
                    channels: ['email', 'phone', 'chat', 'dedicated']
                }
            }
        }
    }
};

// Configuración de descuentos
const discounts = {
    quarterly: 0.10, // 10% de descuento en planes trimestrales
    annual: 0.20,    // 20% de descuento en planes anuales
    enterprise: {
        negotiable: true,
        minDiscount: 0.15,
        maxDiscount: 0.30
    }
};

// Configuración de comisiones
const commissions = {
    platform: 0.10,  // 10% comisión de plataforma
    affiliate: 0.05, // 5% comisión de afiliados
    enterprise: {
        negotiable: true,
        minCommission: 0.05,
        maxCommission: 0.15
    }
};

// Configuración de pruebas gratuitas
const trials = {
    duration: 14, // días
    features: 'professional', // nivel de características durante la prueba
    requireCard: false,      // si se requiere tarjeta para la prueba
    limitations: {
        storage: '5GB',
        events: 2,
        streaming: '10h'
    }
};

module.exports = {
    products,
    discounts,
    commissions,
    trials
};
