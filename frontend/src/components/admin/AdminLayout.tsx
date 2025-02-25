'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const { userProfile, isSuperAdmin } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: '📊' },
    { name: 'Usuarios', href: '/admin/users', icon: '👥' },
    { name: 'Eventos', href: '/admin/events', icon: '📅' },
    { name: 'Artistas', href: '/admin/artists', icon: '🎨' },
    { name: 'Blog', href: '/admin/blog', icon: '📝' },
  ];

  const settingsNavigation = [
    { 
      name: 'Settings', 
      href: '/admin/settings', 
      icon: '⚙️',
      adminOnly: true,
      subItems: [
        { name: 'General', href: '/admin/settings/general', icon: '🔧' },
        { name: 'APIs y Servicios', href: '/admin/settings/services', icon: '🔌' },
        { name: 'Módulos', href: '/admin/settings/modules', icon: '📦' },
        { name: 'Seguridad', href: '/admin/settings/security', icon: '🔒' },
        { name: 'Backups', href: '/admin/settings/backups', icon: '💾' },
        { name: 'Logs', href: '/admin/settings/logs', icon: '📋' }
      ]
    }
  ];

  const isSettingsPage = pathname?.startsWith('/admin/settings');

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-md h-screen fixed">
          <div className="flex flex-col h-full">
            <div className="p-4">
              <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
              <Image
                src="/images/logo/logo.svg"
                alt="Logo"
                width={150}
                height={40}
                style={{ width: 'auto', height: 'auto' }}
              />
            </div>

            <nav className="flex-1 overflow-y-auto">
              <div className="px-2 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      group flex items-center px-2 py-2 text-sm font-medium rounded-md
                      ${
                        pathname === item.href
                          ? 'bg-gray-100 text-gray-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.name}
                  </Link>
                ))}

                <div className="border-t border-gray-200 my-4"></div>

                {settingsNavigation.map((item) => (
                  (!item.adminOnly || isSuperAdmin) && (
                    <div key={item.name}>
                      <Link
                        href={item.href}
                        className={`
                          group flex items-center px-2 py-2 text-sm font-medium rounded-md
                          ${
                            isSettingsPage
                              ? 'bg-gray-100 text-gray-900'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }
                        `}
                      >
                        <span className="mr-3">{item.icon}</span>
                        {item.name}
                      </Link>
                      
                      {isSettingsPage && item.subItems && (
                        <div className="ml-6 mt-1 space-y-1">
                          {item.subItems.map((subItem) => (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className={`
                                group flex items-center px-2 py-1.5 text-sm font-medium rounded-md
                                ${
                                  pathname === subItem.href
                                    ? 'bg-gray-100 text-gray-900'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }
                              `}
                            >
                              <span className="mr-3 text-sm">{subItem.icon}</span>
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                ))}
              </div>
            </nav>

            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="inline-block h-8 w-8 rounded-full bg-gray-200">
                    {userProfile?.displayName?.[0] || '?'}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">
                    {userProfile?.displayName || 'Usuario'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {isSuperAdmin ? 'Super Admin' : 'Admin'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 ml-64">
          <main className="py-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
