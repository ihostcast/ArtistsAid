'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AdminLayout from '@/components/admin/AdminLayout';

interface ServiceStatus {
  name: string;
  status: 'active' | 'inactive';
  configured: boolean;
}

export default function ServicesPage() {
  const { userProfile, isSuperAdmin } = useAuth();
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: 'Google Auth',
      status: 'inactive',
      configured: false
    },
    {
      name: 'Apple Sign In',
      status: 'inactive',
      configured: false
    },
    {
      name: 'Stripe Payments',
      status: 'inactive',
      configured: false
    },
    {
      name: 'Twilio SMS',
      status: 'inactive',
      configured: false
    },
    {
      name: 'SendGrid Email',
      status: 'inactive',
      configured: false
    },
    {
      name: 'Google Maps',
      status: 'inactive',
      configured: false
    },
    {
      name: 'AWS S3 Storage',
      status: 'inactive',
      configured: false
    }
  ]);

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
        <h1 className="text-2xl font-bold mb-6">Gestión de Servicios</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.name}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{service.name}</h2>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    service.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {service.status}
                </span>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="text-sm text-gray-600">Configurado:</span>
                  <span className="ml-2">
                    {service.configured ? '✅' : '❌'}
                  </span>
                </div>
                
                <button
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  onClick={() => {
                    // Aquí irá la lógica para configurar cada servicio
                  }}
                >
                  Configurar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
