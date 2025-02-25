'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import AdminLayout from '@/components/admin/AdminLayout';
import { PERMISSIONS } from '@/types/roles';

interface ServiceConfig {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'error';
  apiKey?: string;
  endpoint?: string;
  icon: string;
  lastCheck?: string;
  category: 'payment' | 'communication' | 'storage' | 'analytics' | 'maps';
}

export default function ServicesPage() {
  const { userProfile } = useAuth();
  const { hasPermission } = usePermissions();

  const [services, setServices] = useState<ServiceConfig[]>([
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Procesamiento de pagos y suscripciones',
      status: 'active',
      category: 'payment',
      icon: '💳',
      lastCheck: '2025-02-24T18:00:00'
    },
    {
      id: 'twilio',
      name: 'Twilio',
      description: 'SMS y notificaciones',
      status: 'inactive',
      category: 'communication',
      icon: '📱'
    },
    {
      id: 'sendgrid',
      name: 'SendGrid',
      description: 'Envío de emails',
      status: 'active',
      category: 'communication',
      icon: '📧',
      lastCheck: '2025-02-24T17:30:00'
    },
    {
      id: 's3',
      name: 'AWS S3',
      description: 'Almacenamiento de archivos',
      status: 'active',
      category: 'storage',
      icon: '📁',
      lastCheck: '2025-02-24T18:15:00'
    },
    {
      id: 'google-maps',
      name: 'Google Maps',
      description: 'Servicios de mapas y geolocalización',
      status: 'active',
      category: 'maps',
      icon: '🗺️',
      lastCheck: '2025-02-24T18:10:00'
    },
    {
      id: 'analytics',
      name: 'Google Analytics',
      description: 'Análisis de usuarios y eventos',
      status: 'error',
      category: 'analytics',
      icon: '📊'
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'Todos', icon: '🔧' },
    { id: 'payment', name: 'Pagos', icon: '💳' },
    { id: 'communication', name: 'Comunicación', icon: '📱' },
    { id: 'storage', name: 'Almacenamiento', icon: '📁' },
    { id: 'analytics', name: 'Analytics', icon: '📊' },
    { id: 'maps', name: 'Mapas', icon: '🗺️' }
  ];

  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(service => service.category === selectedCategory);

  const handleServiceToggle = (serviceId: string) => {
    setServices(services.map(service => {
      if (service.id === serviceId) {
        return {
          ...service,
          status: service.status === 'active' ? 'inactive' : 'active'
        };
      }
      return service;
    }));
  };

  if (!hasPermission(PERMISSIONS.SETTINGS_VIEW)) {
    return (
      <AdminLayout>
        <div className="p-4">
          <h1 className="text-2xl font-bold text-red-600">
            Acceso Restringido
          </h1>
          <p className="mt-2">
            No tienes permisos para ver esta página.
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Servicios</h1>
          <p className="mt-2 text-sm text-gray-600">
            Gestiona los servicios externos y sus configuraciones
          </p>
        </div>

        {/* Categorías */}
        <div className="mb-6">
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 whitespace-nowrap ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Servicios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{service.icon}</span>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {service.name}
                    </h2>
                    {service.lastCheck && (
                      <p className="text-xs text-gray-500">
                        Última verificación: {new Date(service.lastCheck).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    service.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : service.status === 'inactive'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {service.status === 'active' ? 'Activo' : 
                   service.status === 'inactive' ? 'Inactivo' : 'Error'}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                {service.description}
              </p>

              <div className="space-y-4">
                {hasPermission(PERMISSIONS.SETTINGS_EDIT) && (
                  <>
                    <button
                      onClick={() => handleServiceToggle(service.id)}
                      className={`w-full py-2 px-4 rounded-md text-sm font-medium ${
                        service.status === 'active'
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {service.status === 'active' ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      className="w-full py-2 px-4 rounded-md text-sm font-medium border border-gray-300 hover:bg-gray-50"
                    >
                      Configurar
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
