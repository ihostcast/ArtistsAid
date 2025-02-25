export type UserRole = 
  | 'superadmin'     // Acceso total
  | 'admin'          // Administración general
  | 'finance_admin'  // Administrador financiero
  | 'content_admin'  // Administrador de contenido
  | 'support_admin'  // Administrador de soporte
  | 'artist'         // Artista
  | 'organizer'      // Organizador de eventos
  | 'user';          // Usuario regular

export interface Permission {
  id: string;
  name: string;
  description: string;
}

export const PERMISSIONS = {
  // Permisos de configuración del sistema
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_EDIT: 'settings.edit',
  
  // Permisos financieros
  FINANCE_VIEW: 'finance.view',
  FINANCE_EDIT: 'finance.edit',
  PAYMENT_CONFIG: 'payment.config',
  STRIPE_MANAGE: 'stripe.manage',
  REFUND_PROCESS: 'refund.process',
  
  // Permisos de contenido
  CONTENT_MANAGE: 'content.manage',
  BLOG_MANAGE: 'blog.manage',
  EVENTS_MANAGE: 'events.manage',
  
  // Permisos de usuarios
  USERS_VIEW: 'users.view',
  USERS_EDIT: 'users.edit',
  ROLES_MANAGE: 'roles.manage',
  
  // Permisos de soporte
  SUPPORT_TICKETS: 'support.tickets',
  SUPPORT_CHAT: 'support.chat',
  
  // Permisos de artistas
  ARTIST_PROFILE: 'artist.profile',
  ARTIST_EVENTS: 'artist.events',
  ARTIST_EARNINGS: 'artist.earnings',
  
  // Permisos de organizadores
  ORGANIZER_EVENTS: 'organizer.events',
  ORGANIZER_PAYMENTS: 'organizer.payments',
} as const;

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  superadmin: Object.values(PERMISSIONS),
  
  admin: [
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_EDIT,
    PERMISSIONS.CONTENT_MANAGE,
    PERMISSIONS.SUPPORT_TICKETS,
    PERMISSIONS.SUPPORT_CHAT
  ],
  
  finance_admin: [
    PERMISSIONS.FINANCE_VIEW,
    PERMISSIONS.FINANCE_EDIT,
    PERMISSIONS.PAYMENT_CONFIG,
    PERMISSIONS.STRIPE_MANAGE,
    PERMISSIONS.REFUND_PROCESS
  ],
  
  content_admin: [
    PERMISSIONS.CONTENT_MANAGE,
    PERMISSIONS.BLOG_MANAGE,
    PERMISSIONS.EVENTS_MANAGE
  ],
  
  support_admin: [
    PERMISSIONS.SUPPORT_TICKETS,
    PERMISSIONS.SUPPORT_CHAT,
    PERMISSIONS.USERS_VIEW
  ],
  
  artist: [
    PERMISSIONS.ARTIST_PROFILE,
    PERMISSIONS.ARTIST_EVENTS,
    PERMISSIONS.ARTIST_EARNINGS
  ],
  
  organizer: [
    PERMISSIONS.ORGANIZER_EVENTS,
    PERMISSIONS.ORGANIZER_PAYMENTS
  ],
  
  user: []
};
