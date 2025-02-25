'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AdminLayout from '@/components/admin/AdminLayout';

interface Module {
  id: string;
  name: string;
  description: string;
  version: string;
  status: 'installed' | 'not_installed' | 'update_available';
  dependencies: string[];
  icon: string;
}

export default function ModulesPage() {
  const { userProfile, isSuperAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'installed' | 'not_installed'>('all');

  const modules: Module[] = [
    {
      id: 'payment',
      name: 'Sistema de Pagos',
      description: 'Integración con Stripe para procesar pagos',
      version: '1.2.0',
      status: 'installed',
      dependencies: ['core'],
      icon: '💳'
    },
    {
      id: 'messaging',
      name: 'Sistema de Mensajería',
      description: 'Integración con Twilio para SMS y WhatsApp',
      version: '1.0.0',
      status: 'not_installed',
      dependencies: ['core'],
      icon: '💬'
    },
    {
      id: 'email',
      name: 'Sistema de Email',
      description: 'Integración con SendGrid para emails',
      version: '2.1.0',
      status: 'update_available',
      dependencies: ['core'],
      icon: '📧'
    },
    {
      id: 'maps',
      name: 'Mapas y Ubicación',
      description: 'Integración con Google Maps',
      version: '1.1.0',
      status: 'installed',
      dependencies: ['core'],
      icon: '🗺️'
    },
    {
      id: 'analytics',
      name: 'Analytics',
      description: 'Seguimiento y análisis de usuarios',
      version: '1.0.0',
      status: 'not_installed',
      dependencies: ['core'],
      icon: '📊'
    }
  ];

  const filteredModules = modules.filter(module => {
    const matchesSearch = module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'installed' && module.status === 'installed') ||
                         (filter === 'not_installed' && module.status === 'not_installed');
    return matchesSearch && matchesFilter;
  });

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
          <h1 className="text-2xl font-bold text-gray-900">Módulos</h1>
          <p className="mt-2 text-sm text-gray-600">
            Gestiona los módulos y componentes de la plataforma
          </p>
        </div>

        {/* Filtros y Búsqueda */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar módulos..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter('installed')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'installed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Instalados
            </button>
            <button
              onClick={() => setFilter('not_installed')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'not_installed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              No Instalados
            </button>
          </div>
        </div>

        {/* Lista de Módulos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules.map((module) => (
            <div
              key={module.id}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{module.icon}</span>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {module.name}
                    </h2>
                    <p className="text-sm text-gray-500">v{module.version}</p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    module.status === 'installed'
                      ? 'bg-green-100 text-green-800'
                      : module.status === 'update_available'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {module.status === 'installed'
                    ? 'Instalado'
                    : module.status === 'update_available'
                    ? 'Actualización'
                    : 'No Instalado'}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                {module.description}
              </p>

              <div className="space-y-4">
                <div className="text-sm text-gray-500">
                  Dependencias: {module.dependencies.join(', ')}
                </div>

                <button
                  className={`w-full py-2 px-4 rounded-md text-sm font-medium ${
                    module.status === 'installed'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : module.status === 'update_available'
                      ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {module.status === 'installed'
                    ? 'Desinstalar'
                    : module.status === 'update_available'
                    ? 'Actualizar'
                    : 'Instalar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
