'use client';

import { useAuth } from './useAuth';
import { ROLE_PERMISSIONS, PERMISSIONS, UserRole } from '@/types/roles';

export const usePermissions = () => {
  const { userProfile } = useAuth();
  
  const hasPermission = (permission: string): boolean => {
    if (!userProfile?.role) return false;
    
    // Superadmin tiene todos los permisos
    if (userProfile.role === 'superadmin') return true;
    
    // Verificar si el rol del usuario tiene el permiso específico
    const rolePermissions = ROLE_PERMISSIONS[userProfile.role as UserRole] || [];
    return rolePermissions.includes(permission);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  // Permisos específicos para configuraciones financieras
  const canManageFinance = (): boolean => {
    return hasAnyPermission([
      PERMISSIONS.FINANCE_VIEW,
      PERMISSIONS.FINANCE_EDIT,
      PERMISSIONS.PAYMENT_CONFIG
    ]);
  };

  // Permisos para configuraciones de contenido
  const canManageContent = (): boolean => {
    return hasAnyPermission([
      PERMISSIONS.CONTENT_MANAGE,
      PERMISSIONS.BLOG_MANAGE,
      PERMISSIONS.EVENTS_MANAGE
    ]);
  };

  // Permisos para configuraciones de soporte
  const canManageSupport = (): boolean => {
    return hasAnyPermission([
      PERMISSIONS.SUPPORT_TICKETS,
      PERMISSIONS.SUPPORT_CHAT
    ]);
  };

  // Permisos para gestión de usuarios
  const canManageUsers = (): boolean => {
    return hasAnyPermission([
      PERMISSIONS.USERS_VIEW,
      PERMISSIONS.USERS_EDIT,
      PERMISSIONS.ROLES_MANAGE
    ]);
  };

  // Permisos específicos para artistas
  const canManageArtistProfile = (): boolean => {
    return hasPermission(PERMISSIONS.ARTIST_PROFILE);
  };

  // Permisos específicos para organizadores
  const canManageEvents = (): boolean => {
    return hasAnyPermission([
      PERMISSIONS.EVENTS_MANAGE,
      PERMISSIONS.ORGANIZER_EVENTS
    ]);
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canManageFinance,
    canManageContent,
    canManageSupport,
    canManageUsers,
    canManageArtistProfile,
    canManageEvents
  };
};
