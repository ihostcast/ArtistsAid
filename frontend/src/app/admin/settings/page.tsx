'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';

interface SettingSection {
  title: string;
  description: string;
  href: string;
  icon: string;
  status?: 'configured' | 'pending' | 'error';
}

export default function SettingsPage() {
  const { userProfile, isSuperAdmin } = useAuth();

  const sections: SettingSection[] = [
    {
      title: 'General',
      description: 'Configuración general de la aplicación, branding y preferencias',
      href: '/admin/settings/general',
      icon: '🔧',
      status: 'configured'
    },
    {
      title: 'APIs y Servicios',
      description: 'Gestión de APIs externas, claves y configuración de servicios',
      href: '/admin/settings/services',
      icon: '🔌',
      status: 'pending'
    },
    {
      title: 'Módulos',
      description: 'Instalación y configuración de módulos y componentes',
      href: '/admin/settings/modules',
      icon: '📦',
      status: 'configured'
    },
    {
      title: 'Seguridad',
      description: 'Configuración de autenticación, permisos y políticas de seguridad',
      href: '/admin/settings/security',
      icon: '🔒',
      status: 'configured'
    },
    {
      title: 'Backups',
      description: 'Gestión de copias de seguridad y restauración',
      href: '/admin/settings/backups',
      icon: '💾',
      status: 'pending'
    },
    {
      title: 'Logs',
      description: 'Registros del sistema y monitoreo de actividad',
      href: '/admin/settings/logs',
      icon: '📋',
      status: 'configured'
    }
  ];

  if (!isSuperAdmin) {
    return (
      <AdminLayout>
        <div className="p-4">
          <h1 className="text-2xl font-bold text-red-600">
            Acceso Restringido
          </h1>
          <p className="mt-2">
            Solo los super administradores pueden acceder a esta página.
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-sm text-gray-600">
            Gestiona todas las configuraciones y componentes de la plataforma
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section) => (
            <Link
              key={section.title}
              href={section.href}
              className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{section.icon}</span>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {section.title}
                  </h2>
                </div>
                {section.status && (
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      section.status === 'configured'
                        ? 'bg-green-100 text-green-800'
                        : section.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {section.status}
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-600">
                {section.description}
              </p>
            </Link>
          ))}
        </div>

        {/* System Information */}
        <div className="mt-12 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Información del Sistema</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600">Versión</p>
              <p className="mt-1 text-lg">1.0.0</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600">Último Backup</p>
              <p className="mt-1 text-lg">Hace 2 días</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600">Estado del Sistema</p>
              <p className="mt-1 text-lg text-green-600">Operativo</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
