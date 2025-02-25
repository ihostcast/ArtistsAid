'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import AdminLayout from '@/components/admin/AdminLayout';
import { PERMISSIONS } from '@/types/roles';

interface GeneralConfig {
  siteName: string;
  siteDescription: string;
  logo: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dateFormat: string;
  contactEmail: string;
  supportPhone: string;
  address: string;
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };
}

export default function GeneralSettingsPage() {
  const { userProfile } = useAuth();
  const { hasPermission } = usePermissions();

  const [config, setConfig] = useState<GeneralConfig>({
    siteName: 'ArtistsAid',
    siteDescription: 'Plataforma para artistas y organizadores de eventos',
    logo: '/logo.png',
    theme: 'system',
    language: 'es',
    timezone: 'America/Mexico_City',
    dateFormat: 'DD/MM/YYYY',
    contactEmail: 'contacto@artistsaid.com',
    supportPhone: '+1234567890',
    address: 'Ciudad de México, México',
    socialMedia: {
      facebook: 'https://facebook.com/artistsaid',
      twitter: 'https://twitter.com/artistsaid',
      instagram: 'https://instagram.com/artistsaid'
    }
  });

  const themes = [
    { id: 'light', name: 'Claro', icon: '☀️' },
    { id: 'dark', name: 'Oscuro', icon: '🌙' },
    { id: 'system', name: 'Sistema', icon: '⚙️' }
  ];

  const languages = [
    { code: 'es', name: 'Español' },
    { code: 'en', name: 'English' },
    { code: 'pt', name: 'Português' }
  ];

  const timezones = [
    { code: 'America/Mexico_City', name: 'Ciudad de México (UTC-6)' },
    { code: 'America/New_York', name: 'Nueva York (UTC-5)' },
    { code: 'America/Los_Angeles', name: 'Los Ángeles (UTC-8)' },
    { code: 'Europe/Madrid', name: 'Madrid (UTC+1)' }
  ];

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
          <h1 className="text-2xl font-bold text-gray-900">Configuración General</h1>
          <p className="mt-2 text-sm text-gray-600">
            Configura los ajustes básicos de la plataforma
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Información Básica */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Información Básica</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Nombre del Sitio
                </label>
                <input
                  type="text"
                  value={config.siteName}
                  onChange={(e) => setConfig({...config, siteName: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  disabled={!hasPermission(PERMISSIONS.SETTINGS_EDIT)}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={config.siteDescription}
                  onChange={(e) => setConfig({...config, siteDescription: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg"
                  disabled={!hasPermission(PERMISSIONS.SETTINGS_EDIT)}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Logo
                </label>
                <div className="flex items-center space-x-4">
                  <img
                    src={config.logo}
                    alt="Logo"
                    className="h-12 w-12 object-contain"
                  />
                  {hasPermission(PERMISSIONS.SETTINGS_EDIT) && (
                    <button
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      Cambiar Logo
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Apariencia */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Apariencia</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Tema
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {themes.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => setConfig({...config, theme: theme.id as any})}
                      className={`p-2 rounded-lg flex items-center justify-center ${
                        config.theme === theme.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                      disabled={!hasPermission(PERMISSIONS.SETTINGS_EDIT)}
                    >
                      <span className="mr-2">{theme.icon}</span>
                      {theme.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Idioma
                </label>
                <select
                  value={config.language}
                  onChange={(e) => setConfig({...config, language: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  disabled={!hasPermission(PERMISSIONS.SETTINGS_EDIT)}
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Información de Contacto</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Email de Contacto
                </label>
                <input
                  type="email"
                  value={config.contactEmail}
                  onChange={(e) => setConfig({...config, contactEmail: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  disabled={!hasPermission(PERMISSIONS.SETTINGS_EDIT)}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Teléfono de Soporte
                </label>
                <input
                  type="tel"
                  value={config.supportPhone}
                  onChange={(e) => setConfig({...config, supportPhone: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  disabled={!hasPermission(PERMISSIONS.SETTINGS_EDIT)}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  value={config.address}
                  onChange={(e) => setConfig({...config, address: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  disabled={!hasPermission(PERMISSIONS.SETTINGS_EDIT)}
                />
              </div>
            </div>
          </div>

          {/* Redes Sociales */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Redes Sociales</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Facebook
                </label>
                <input
                  type="url"
                  value={config.socialMedia.facebook}
                  onChange={(e) => setConfig({
                    ...config,
                    socialMedia: {...config.socialMedia, facebook: e.target.value}
                  })}
                  className="w-full px-3 py-2 border rounded-lg"
                  disabled={!hasPermission(PERMISSIONS.SETTINGS_EDIT)}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Twitter
                </label>
                <input
                  type="url"
                  value={config.socialMedia.twitter}
                  onChange={(e) => setConfig({
                    ...config,
                    socialMedia: {...config.socialMedia, twitter: e.target.value}
                  })}
                  className="w-full px-3 py-2 border rounded-lg"
                  disabled={!hasPermission(PERMISSIONS.SETTINGS_EDIT)}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Instagram
                </label>
                <input
                  type="url"
                  value={config.socialMedia.instagram}
                  onChange={(e) => setConfig({
                    ...config,
                    socialMedia: {...config.socialMedia, instagram: e.target.value}
                  })}
                  className="w-full px-3 py-2 border rounded-lg"
                  disabled={!hasPermission(PERMISSIONS.SETTINGS_EDIT)}
                />
              </div>
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
