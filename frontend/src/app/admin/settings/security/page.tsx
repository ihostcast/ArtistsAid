'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import AdminLayout from '@/components/admin/AdminLayout';
import { PERMISSIONS } from '@/types/roles';

interface SecurityConfig {
  twoFactorAuth: boolean;
  passwordPolicy: {
    minLength: number;
    requireNumbers: boolean;
    requireSymbols: boolean;
    requireUppercase: boolean;
    expirationDays: number;
  };
  sessionTimeout: number;
  ipWhitelist: string[];
  loginAttempts: number;
  adminNotifications: boolean;
}

export default function SecurityPage() {
  const { userProfile } = useAuth();
  const { hasPermission } = usePermissions();

  const [config, setConfig] = useState<SecurityConfig>({
    twoFactorAuth: true,
    passwordPolicy: {
      minLength: 8,
      requireNumbers: true,
      requireSymbols: true,
      requireUppercase: true,
      expirationDays: 90
    },
    sessionTimeout: 30,
    ipWhitelist: ['192.168.1.1', '10.0.0.1'],
    loginAttempts: 3,
    adminNotifications: true
  });

  const handlePasswordPolicyChange = (field: keyof SecurityConfig['passwordPolicy'], value: boolean | number) => {
    setConfig({
      ...config,
      passwordPolicy: {
        ...config.passwordPolicy,
        [field]: value
      }
    });
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
          <h1 className="text-2xl font-bold text-gray-900">Seguridad</h1>
          <p className="mt-2 text-sm text-gray-600">
            Configura las políticas de seguridad y autenticación
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Autenticación de Dos Factores */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Autenticación de Dos Factores</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">2FA Obligatorio</span>
                <button
                  onClick={() => setConfig({...config, twoFactorAuth: !config.twoFactorAuth})}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    config.twoFactorAuth ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                  disabled={!hasPermission(PERMISSIONS.SETTINGS_EDIT)}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      config.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Política de Contraseñas */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Política de Contraseñas</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Longitud Mínima
                </label>
                <input
                  type="number"
                  value={config.passwordPolicy.minLength}
                  onChange={(e) => handlePasswordPolicyChange('minLength', Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg"
                  disabled={!hasPermission(PERMISSIONS.SETTINGS_EDIT)}
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.passwordPolicy.requireNumbers}
                  onChange={(e) => handlePasswordPolicyChange('requireNumbers', e.target.checked)}
                  className="h-4 w-4 text-blue-600"
                  disabled={!hasPermission(PERMISSIONS.SETTINGS_EDIT)}
                />
                <label className="ml-2 text-sm text-gray-700">
                  Requerir números
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.passwordPolicy.requireSymbols}
                  onChange={(e) => handlePasswordPolicyChange('requireSymbols', e.target.checked)}
                  className="h-4 w-4 text-blue-600"
                  disabled={!hasPermission(PERMISSIONS.SETTINGS_EDIT)}
                />
                <label className="ml-2 text-sm text-gray-700">
                  Requerir símbolos
                </label>
              </div>
            </div>
          </div>

          {/* Sesión */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Configuración de Sesión</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Tiempo de expiración (minutos)
                </label>
                <input
                  type="number"
                  value={config.sessionTimeout}
                  onChange={(e) => setConfig({...config, sessionTimeout: Number(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-lg"
                  disabled={!hasPermission(PERMISSIONS.SETTINGS_EDIT)}
                />
              </div>
            </div>
          </div>

          {/* Lista Blanca IP */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Lista Blanca IP</h2>
            <div className="space-y-4">
              {config.ipWhitelist.map((ip, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{ip}</span>
                  {hasPermission(PERMISSIONS.SETTINGS_EDIT) && (
                    <button
                      onClick={() => {
                        setConfig({
                          ...config,
                          ipWhitelist: config.ipWhitelist.filter((_, i) => i !== index)
                        });
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              ))}
              {hasPermission(PERMISSIONS.SETTINGS_EDIT) && (
                <button
                  className="w-full py-2 px-4 border border-gray-300 rounded-lg text-sm"
                >
                  Agregar IP
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="mt-6 flex justify-end space-x-4">
          <button
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            disabled={!hasPermission(PERMISSIONS.SETTINGS_EDIT)}
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
