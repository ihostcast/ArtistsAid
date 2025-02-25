'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserProfile } from '@/types/user';
import Logo from '@/components/Logo';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  HomeIcon,
  UsersIcon,
  MusicalNoteIcon,
  CalendarIcon,
  TicketIcon,
  Cog6ToothIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const ICON_MAP = {
  'home': HomeIcon,
  'users': UsersIcon,
  'music': MusicalNoteIcon,
  'calendar': CalendarIcon,
  'ticket': TicketIcon,
  'settings': Cog6ToothIcon,
  'document': DocumentTextIcon
};

interface SidebarProps {
  userProfile: UserProfile;
}

export default function Sidebar({ userProfile }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: 'home',
    },
    {
      name: 'Eventos',
      href: '/admin/events',
      icon: 'calendar',
    },
    {
      name: 'Blog',
      href: '/admin/blogs',
      icon: 'document',
    },
    {
      name: 'Usuarios',
      href: '/admin/users',
      icon: 'users',
    },
    {
      name: 'Configuración',
      href: '/admin/settings',
      icon: 'settings',
    },
  ];

  const visibleMenuItems = navigation.filter(item => 
    item.roles ? item.roles.includes(userProfile.role) : true
  );

  return (
    <div 
      className={`bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out ${
        collapsed ? 'w-16' : 'w-64'
      } min-h-screen fixed left-0 top-0 shadow-sm`}
    >
      <div className="h-14 flex items-center justify-between px-3 border-b border-gray-200 dark:border-gray-800">
        {!collapsed && <Logo />}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          {collapsed ? (
            <ChevronRightIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronLeftIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          )}
        </button>
      </div>

      <nav className="mt-4 px-2">
        {visibleMenuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = ICON_MAP[item.icon as keyof typeof ICON_MAP];
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2 my-1 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                  : 'text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Icon className={`w-5 h-5 ${
                isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'
              }`} />
              {!collapsed && (
                <span className={`ml-3 text-sm font-medium ${
                  isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-400'
                }`}>
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
