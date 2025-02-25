'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import AdminLayout from '@/components/admin/AdminLayout';
import { PERMISSIONS } from '@/types/roles';
import { ChromePicker } from 'react-color';

interface ThemeConfig {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    headerBg: string;
    headerText: string;
    footerBg: string;
    footerText: string;
    linkColor: string;
    buttonBg: string;
    buttonText: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    fontSize: {
      base: string;
      h1: string;
      h2: string;
      h3: string;
      small: string;
    };
  };
  layout: {
    maxWidth: string;
    headerHeight: string;
    footerHeight: string;
    sidebarWidth: string;
    containerPadding: string;
  };
  components: {
    borderRadius: string;
    boxShadow: string;
    inputBorderColor: string;
    cardBackground: string;
  };
}

export default function ThemesPage() {
  const { userProfile } = useAuth();
  const { hasPermission } = usePermissions();
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const [theme, setTheme] = useState<ThemeConfig>({
    name: 'Default Theme',
    colors: {
      primary: '#3B82F6',
      secondary: '#6B7280',
      accent: '#10B981',
      background: '#F3F4F6',
      text: '#1F2937',
      headerBg: '#1F2937',
      headerText: '#FFFFFF',
      footerBg: '#1F2937',
      footerText: '#FFFFFF',
      linkColor: '#3B82F6',
      buttonBg: '#3B82F6',
      buttonText: '#FFFFFF'
    },
    typography: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
      fontSize: {
        base: '16px',
        h1: '2.5rem',
        h2: '2rem',
        h3: '1.75rem',
        small: '0.875rem'
      }
    },
    layout: {
      maxWidth: '1280px',
      headerHeight: '64px',
      footerHeight: '200px',
      sidebarWidth: '250px',
      containerPadding: '1rem'
    },
    components: {
      borderRadius: '0.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      inputBorderColor: '#E5E7EB',
      cardBackground: '#FFFFFF'
    }
  });

  const [previewSection, setPreviewSection] = useState<'header' | 'content' | 'footer'>('header');

  const handleColorChange = (color: string) => {
    if (activeColor) {
      setTheme({
        ...theme,
        colors: {
          ...theme.colors,
          [activeColor]: color
        }
      });
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Personalización del Tema</h1>
          <p className="mt-2 text-sm text-gray-600">
            Personaliza los colores, tipografía y estilos de tu sitio
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Panel de Control */}
          <div className="space-y-6">
            {/* Colores */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Colores</h2>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(theme.colors).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <div
                      className="w-8 h-8 rounded cursor-pointer border"
                      style={{ backgroundColor: value }}
                      onClick={() => {
                        setActiveColor(key);
                        setShowColorPicker(true);
                      }}
                    />
                    <span className="text-sm text-gray-600 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </div>
                ))}
              </div>
              {showColorPicker && activeColor && (
                <div className="absolute z-10 mt-2">
                  <div
                    className="fixed inset-0"
                    onClick={() => setShowColorPicker(false)}
                  />
                  <ChromePicker
                    color={theme.colors[activeColor as keyof typeof theme.colors]}
                    onChange={(color) => handleColorChange(color.hex)}
                  />
                </div>
              )}
            </div>

            {/* Tipografía */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Tipografía</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Fuente de Títulos
                  </label>
                  <select
                    value={theme.typography.headingFont}
                    onChange={(e) => setTheme({
                      ...theme,
                      typography: {
                        ...theme.typography,
                        headingFont: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Poppins">Poppins</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Tamaño Base
                  </label>
                  <input
                    type="text"
                    value={theme.typography.fontSize.base}
                    onChange={(e) => setTheme({
                      ...theme,
                      typography: {
                        ...theme.typography,
                        fontSize: {
                          ...theme.typography.fontSize,
                          base: e.target.value
                        }
                      }
                    })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Layout */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Layout</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Ancho Máximo
                  </label>
                  <input
                    type="text"
                    value={theme.layout.maxWidth}
                    onChange={(e) => setTheme({
                      ...theme,
                      layout: {
                        ...theme.layout,
                        maxWidth: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Altura del Header
                  </label>
                  <input
                    type="text"
                    value={theme.layout.headerHeight}
                    onChange={(e) => setTheme({
                      ...theme,
                      layout: {
                        ...theme.layout,
                        headerHeight: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Vista Previa */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Vista Previa</h2>
            </div>
            
            <div className="p-4">
              {/* Selector de Sección */}
              <div className="flex space-x-2 mb-4">
                <button
                  onClick={() => setPreviewSection('header')}
                  className={`px-4 py-2 rounded ${
                    previewSection === 'header'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100'
                  }`}
                >
                  Header
                </button>
                <button
                  onClick={() => setPreviewSection('content')}
                  className={`px-4 py-2 rounded ${
                    previewSection === 'content'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100'
                  }`}
                >
                  Contenido
                </button>
                <button
                  onClick={() => setPreviewSection('footer')}
                  className={`px-4 py-2 rounded ${
                    previewSection === 'footer'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100'
                  }`}
                >
                  Footer
                </button>
              </div>

              {/* Vista Previa del Header */}
              {previewSection === 'header' && (
                <div
                  style={{
                    backgroundColor: theme.colors.headerBg,
                    color: theme.colors.headerText,
                    height: theme.layout.headerHeight
                  }}
                  className="rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="font-bold" style={{ fontFamily: theme.typography.headingFont }}>
                    Logo
                  </div>
                  <nav className="space-x-4">
                    <a href="#" style={{ color: theme.colors.headerText }}>Inicio</a>
                    <a href="#" style={{ color: theme.colors.headerText }}>Eventos</a>
                    <a href="#" style={{ color: theme.colors.headerText }}>Blog</a>
                  </nav>
                </div>
              )}

              {/* Vista Previa del Contenido */}
              {previewSection === 'content' && (
                <div
                  style={{
                    backgroundColor: theme.colors.background,
                    padding: theme.layout.containerPadding
                  }}
                  className="rounded-lg"
                >
                  <h1 style={{
                    color: theme.colors.text,
                    fontFamily: theme.typography.headingFont,
                    fontSize: theme.typography.fontSize.h1
                  }}>
                    Título Principal
                  </h1>
                  <p style={{
                    color: theme.colors.text,
                    fontFamily: theme.typography.bodyFont,
                    fontSize: theme.typography.fontSize.base
                  }}>
                    Contenido de ejemplo para mostrar los estilos del texto.
                  </p>
                  <button
                    style={{
                      backgroundColor: theme.colors.buttonBg,
                      color: theme.colors.buttonText,
                      borderRadius: theme.components.borderRadius
                    }}
                    className="px-4 py-2 mt-4"
                  >
                    Botón de Ejemplo
                  </button>
                </div>
              )}

              {/* Vista Previa del Footer */}
              {previewSection === 'footer' && (
                <div
                  style={{
                    backgroundColor: theme.colors.footerBg,
                    color: theme.colors.footerText,
                    height: theme.layout.footerHeight
                  }}
                  className="rounded-lg p-4"
                >
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <h3 style={{ fontFamily: theme.typography.headingFont }}>
                        Sobre Nosotros
                      </h3>
                      <p style={{ fontSize: theme.typography.fontSize.small }}>
                        Información sobre el sitio
                      </p>
                    </div>
                    <div>
                      <h3 style={{ fontFamily: theme.typography.headingFont }}>
                        Enlaces
                      </h3>
                      <ul style={{ fontSize: theme.typography.fontSize.small }}>
                        <li>
                          <a href="#" style={{ color: theme.colors.footerText }}>
                            Términos
                          </a>
                        </li>
                        <li>
                          <a href="#" style={{ color: theme.colors.footerText }}>
                            Privacidad
                          </a>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 style={{ fontFamily: theme.typography.headingFont }}>
                        Contacto
                      </h3>
                      <p style={{ fontSize: theme.typography.fontSize.small }}>
                        info@example.com
                      </p>
                    </div>
                  </div>
                </div>
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
            Guardar Tema
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
