'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import AdminLayout from '@/components/admin/AdminLayout';
import { PERMISSIONS } from '@/types/roles';
import Link from 'next/link';

interface ContentType {
  id: string;
  name: string;
  description: string;
  icon: string;
  permission: string;
  route: string;
  count: number;
  lastUpdated: string;
}

export default function CMSPage() {
  const { userProfile } = useAuth();
  const { hasPermission } = usePermissions();

  const contentTypes: ContentType[] = [
    {
      id: 'blog',
      name: 'Blog',
      description: 'Gestiona artículos y noticias',
      icon: '📝',
      permission: PERMISSIONS.BLOG_MANAGE,
      route: '/admin/cms/blog',
      count: 15,
      lastUpdated: '2025-02-24T18:00:00'
    },
    {
      id: 'music',
      name: 'Música',
      description: 'Sube y gestiona pistas de música',
      icon: '🎵',
      permission: PERMISSIONS.CONTENT_MANAGE,
      route: '/admin/cms/music',
      count: 50,
      lastUpdated: '2025-02-24T17:30:00'
    },
    {
      id: 'photos',
      name: 'Fotos',
      description: 'Galería de imágenes y álbumes',
      icon: '📸',
      permission: PERMISSIONS.CONTENT_MANAGE,
      route: '/admin/cms/photos',
      count: 120,
      lastUpdated: '2025-02-24T16:45:00'
    },
    {
      id: 'events',
      name: 'Eventos',
      description: 'Administra eventos y conciertos',
      icon: '🎪',
      permission: PERMISSIONS.EVENTS_MANAGE,
      route: '/admin/cms/events',
      count: 8,
      lastUpdated: '2025-02-24T18:15:00'
    },
    {
      id: 'pages',
      name: 'Páginas',
      description: 'Crea y edita páginas del sitio',
      icon: '📄',
      permission: PERMISSIONS.CONTENT_MANAGE,
      route: '/admin/cms/pages',
      count: 5,
      lastUpdated: '2025-02-24T15:20:00'
    },
    {
      id: 'categories',
      name: 'Categorías',
      description: 'Gestiona las categorías de contenido',
      icon: '🏷️',
      permission: PERMISSIONS.CONTENT_MANAGE,
      route: '/admin/cms/categories',
      count: 12,
      lastUpdated: '2025-02-24T14:30:00'
    }
  ];

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Contenido</h1>
          <p className="mt-2 text-sm text-gray-600">
            Administra todo el contenido de tu plataforma
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contentTypes.map((type) => (
            hasPermission(type.permission) && (
              <Link
                key={type.id}
                href={type.route}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{type.icon}</span>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {type.name}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {type.count} elementos
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    Última actualización: {new Date(type.lastUpdated).toLocaleString()}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  {type.description}
                </p>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Ver detalles →
                  </span>
                  {type.count > 0 && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {type.count} items
                    </span>
                  )}
                </div>
              </Link>
            )
          ))}
        </div>

        {/* Acciones Rápidas */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              disabled={!hasPermission(PERMISSIONS.BLOG_MANAGE)}
            >
              <span className="block text-xl mb-2">📝</span>
              Nuevo Artículo
            </button>
            <button
              className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              disabled={!hasPermission(PERMISSIONS.CONTENT_MANAGE)}
            >
              <span className="block text-xl mb-2">🎵</span>
              Subir Música
            </button>
            <button
              className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              disabled={!hasPermission(PERMISSIONS.EVENTS_MANAGE)}
            >
              <span className="block text-xl mb-2">🎪</span>
              Crear Evento
            </button>
            <button
              className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              disabled={!hasPermission(PERMISSIONS.CONTENT_MANAGE)}
            >
              <span className="block text-xl mb-2">📄</span>
              Nueva Página
            </button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Resumen de Contenido</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600">Total Artículos</h3>
              <p className="mt-1 text-2xl font-semibold">15</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600">Pistas de Música</h3>
              <p className="mt-1 text-2xl font-semibold">50</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600">Eventos Activos</h3>
              <p className="mt-1 text-2xl font-semibold">8</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-600">Total Páginas</h3>
              <p className="mt-1 text-2xl font-semibold">5</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
