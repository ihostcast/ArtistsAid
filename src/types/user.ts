import { Timestamp } from 'firebase/firestore';

export type UserRole = 'user' | 'admin' | 'superadmin';
export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  status?: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  photoURL?: string | null;
}

export interface MenuItem {
  name: string;
  icon: string;
  href: string;
  roles: UserRole[];
}

export const MENU_ITEMS: MenuItem[] = [
  {
    name: 'Dashboard',
    icon: 'home',
    href: '/admin',
    roles: ['user', 'admin', 'superadmin']
  },
  {
    name: 'Usuarios',
    icon: 'users',
    href: '/admin/users',
    roles: ['superadmin']
  },
  {
    name: 'Artistas',
    icon: 'music',
    href: '/admin/artists',
    roles: ['superadmin', 'admin']
  },
  {
    name: 'Eventos',
    icon: 'calendar',
    href: '/admin/events',
    roles: ['superadmin', 'admin']
  },
  {
    name: 'Reservas',
    icon: 'ticket',
    href: '/admin/bookings',
    roles: ['superadmin', 'admin']
  },
  {
    name: 'Configuración',
    icon: 'settings',
    href: '/admin/settings',
    roles: ['superadmin']
  }
];
