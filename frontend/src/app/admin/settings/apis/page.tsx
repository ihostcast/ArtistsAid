'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import AdminLayout from '@/components/admin/AdminLayout';
import { PERMISSIONS } from '@/types/roles';
import { FaKey, FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash } from 'react-icons/fa';

interface APIKey {
  id: string;
  name: string;
  key: string;
  isSecret: boolean;
  required?: boolean;
}

interface APIConfig {
  id: string;
  name: string;
  description: string;
  baseUrl: string;
  documentation: string;
  authType: 'bearer' | 'basic' | 'apiKey' | 'oauth2';
  status: 'active' | 'inactive';
  keys: APIKey[];
  headers: Record<string, string>;
  requiredScopes?: string[];
  created: string;
  lastTested: string;
  category: string;
}

export default function APIsPage() {
  const { userProfile } = useAuth();
  const { hasPermission } = usePermissions();
  const [showNewAPIForm, setShowNewAPIForm] = useState(false);
  const [selectedAPI, setSelectedAPI] = useState<APIConfig | null>(null);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAPI, setEditingAPI] = useState<APIConfig | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const [apis, setApis] = useState<APIConfig[]>([
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Procesamiento de pagos',
      baseUrl: 'https://api.stripe.com/v1',
      documentation: 'https://stripe.com/docs/api',
      authType: 'bearer',
      status: 'active',
      keys: [
        { id: 'pk', name: 'Public Key', key: 'pk_test_...', isSecret: false },
        { id: 'sk', name: 'Secret Key', key: 'sk_test_...', isSecret: true },
        { id: 'wh', name: 'Webhook Secret', key: 'whsec_...', isSecret: true }
      ],
      headers: {
        'Content-Type': 'application/json'
      },
      created: '2025-01-01T00:00:00Z',
      lastTested: '2025-02-24T18:00:00Z',
      category: 'payments'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'Pagos y transferencias',
      baseUrl: 'https://api.paypal.com/v1',
      documentation: 'https://developer.paypal.com/docs/api/overview/',
      authType: 'oauth2',
      status: 'active',
      keys: [
        { id: 'client_id', name: 'Client ID', key: 'client_id_...', isSecret: false },
        { id: 'client_secret', name: 'Client Secret', key: 'client_secret_...', isSecret: true }
      ],
      headers: {
        'Content-Type': 'application/json'
      },
      requiredScopes: ['payments', 'refunds'],
      created: '2025-01-01T00:00:00Z',
      lastTested: '2025-02-24T17:00:00Z',
      category: 'payments'
    },
    {
      id: 'sendgrid',
      name: 'SendGrid',
      description: 'Servicio de email transaccional',
      baseUrl: 'https://api.sendgrid.com/v3',
      documentation: 'https://docs.sendgrid.com/api-reference',
      authType: 'bearer',
      status: 'active',
      keys: [
        { id: 'api_key', name: 'API Key', key: 'SG...', isSecret: true }
      ],
      headers: {
        'Content-Type': 'application/json'
      },
      created: '2025-01-01T00:00:00Z',
      lastTested: '2025-02-24T16:00:00Z',
      category: 'email'
    },
    {
      id: 'aws_s3',
      name: 'AWS S3',
      description: 'Almacenamiento en la nube',
      baseUrl: 'https://s3.amazonaws.com',
      documentation: 'https://docs.aws.amazon.com/AmazonS3/latest/API/Welcome.html',
      authType: 'apiKey',
      status: 'active',
      keys: [
        { id: 'access_key', name: 'Access Key ID', key: 'AKIA...', isSecret: false },
        { id: 'secret_key', name: 'Secret Access Key', key: '****', isSecret: true },
        { id: 'bucket', name: 'Bucket Name', key: 'my-bucket', isSecret: false },
        { id: 'region', name: 'Region', key: 'us-east-1', isSecret: false }
      ],
      headers: {},
      created: '2025-01-01T00:00:00Z',
      lastTested: '2025-02-24T15:00:00Z',
      category: 'storage'
    },
    {
      id: 'google_maps',
      name: 'Google Maps',
      description: 'Servicios de mapas y geolocalización',
      baseUrl: 'https://maps.googleapis.com/maps/api',
      documentation: 'https://developers.google.com/maps/documentation',
      authType: 'apiKey',
      status: 'active',
      keys: [
        { id: 'api_key', name: 'API Key', key: 'AIza...', isSecret: true }
      ],
      headers: {},
      created: '2025-01-01T00:00:00Z',
      lastTested: '2025-02-24T14:00:00Z',
      category: 'maps'
    },
    {
      id: 'twilio',
      name: 'Twilio',
      description: 'SMS y servicios de comunicación',
      baseUrl: 'https://api.twilio.com/2010-04-01',
      documentation: 'https://www.twilio.com/docs/api',
      authType: 'basic',
      status: 'active',
      keys: [
        { id: 'account_sid', name: 'Account SID', key: 'AC...', isSecret: false },
        { id: 'auth_token', name: 'Auth Token', key: '****', isSecret: true },
        { id: 'phone_number', name: 'Phone Number', key: '+1234567890', isSecret: false }
      ],
      headers: {},
      created: '2025-01-01T00:00:00Z',
      lastTested: '2025-02-24T13:00:00Z',
      category: 'messaging'
    },
    {
      id: 'openai',
      name: 'OpenAI',
      description: 'Servicios de inteligencia artificial',
      baseUrl: 'https://api.openai.com/v1',
      documentation: 'https://platform.openai.com/docs/api-reference',
      authType: 'bearer',
      status: 'active',
      keys: [
        { id: 'api_key', name: 'API Key', key: 'sk-...', isSecret: true },
        { id: 'org_id', name: 'Organization ID', key: 'org-...', isSecret: false }
      ],
      headers: {
        'Content-Type': 'application/json'
      },
      created: '2025-01-01T00:00:00Z',
      lastTested: '2025-02-24T12:00:00Z',
      category: 'ai'
    },
    {
      id: 'cloudinary',
      name: 'Cloudinary',
      description: 'Gestión y optimización de medios',
      baseUrl: 'https://api.cloudinary.com/v1_1',
      documentation: 'https://cloudinary.com/documentation/api_reference',
      authType: 'apiKey',
      status: 'active',
      keys: [
        { id: 'cloud_name', name: 'Cloud Name', key: 'my-cloud', isSecret: false },
        { id: 'api_key', name: 'API Key', key: '123456789', isSecret: false },
        { id: 'api_secret', name: 'API Secret', key: '****', isSecret: true }
      ],
      headers: {},
      created: '2025-01-01T00:00:00Z',
      lastTested: '2025-02-24T11:00:00Z',
      category: 'storage'
    },
    {
      id: 'mailchimp',
      name: 'Mailchimp',
      description: 'Marketing por email y newsletters',
      baseUrl: 'https://us1.api.mailchimp.com/3.0',
      documentation: 'https://mailchimp.com/developer/marketing/api/',
      authType: 'bearer',
      status: 'active',
      keys: [
        { id: 'api_key', name: 'API Key', key: '****-us1', isSecret: true },
        { id: 'list_id', name: 'List ID', key: 'abc123def', isSecret: false }
      ],
      headers: {
        'Content-Type': 'application/json'
      },
      created: '2025-01-01T00:00:00Z',
      lastTested: '2025-02-24T10:00:00Z',
      category: 'email'
    },
    {
      id: 'spotify',
      name: 'Spotify',
      description: 'API de streaming de música',
      baseUrl: 'https://api.spotify.com/v1',
      documentation: 'https://developer.spotify.com/documentation/web-api',
      authType: 'oauth2',
      status: 'active',
      keys: [
        { id: 'client_id', name: 'Client ID', key: '****', isSecret: false },
        { id: 'client_secret', name: 'Client Secret', key: '****', isSecret: true },
        { id: 'redirect_uri', name: 'Redirect URI', key: 'https://example.com/callback', isSecret: false }
      ],
      headers: {
        'Content-Type': 'application/json'
      },
      requiredScopes: ['user-read-private', 'playlist-modify-public'],
      created: '2025-01-01T00:00:00Z',
      lastTested: '2025-02-24T09:00:00Z',
      category: 'music'
    },
    {
      id: 'google_analytics',
      name: 'Google Analytics',
      description: 'Análisis web y seguimiento',
      baseUrl: 'https://www.googleapis.com/analytics/v3',
      documentation: 'https://developers.google.com/analytics/devguides/reporting/core/v4',
      authType: 'oauth2',
      status: 'active',
      keys: [
        { id: 'tracking_id', name: 'Tracking ID', key: 'UA-XXXXX-Y', isSecret: false },
        { id: 'client_id', name: 'Client ID', key: '****', isSecret: false },
        { id: 'client_secret', name: 'Client Secret', key: '****', isSecret: true }
      ],
      headers: {},
      created: '2025-01-01T00:00:00Z',
      lastTested: '2025-02-24T08:00:00Z',
      category: 'analytics'
    }
  ]);

  const [newAPI, setNewAPI] = useState<Partial<APIConfig>>({
    name: '',
    description: '',
    baseUrl: '',
    documentation: '',
    authType: 'bearer',
    status: 'inactive',
    keys: [],
    headers: {},
    category: ''
  });

  const categories = [
    'payments',
    'email',
    'storage',
    'analytics',
    'social',
    'maps',
    'ai',
    'messaging',
    'other'
  ];

  const handleAddAPI = () => {
    if (!newAPI.name || !newAPI.baseUrl) return;

    const apiConfig: APIConfig = {
      id: Date.now().toString(),
      name: newAPI.name,
      description: newAPI.description || '',
      baseUrl: newAPI.baseUrl,
      documentation: newAPI.documentation || '',
      authType: newAPI.authType || 'bearer',
      status: 'inactive',
      keys: [],
      headers: newAPI.headers || {},
      created: new Date().toISOString(),
      lastTested: new Date().toISOString(),
      category: newAPI.category || 'other'
    };

    setApis([...apis, apiConfig]);
    setNewAPI({});
    setShowNewAPIForm(false);
  };

  const handleAddKey = (apiId: string) => {
    const api = apis.find(a => a.id === apiId);
    if (!api) return;

    const newKey: APIKey = {
      id: Date.now().toString(),
      name: 'Nueva Clave',
      key: '',
      isSecret: true
    };

    const updatedApi = {
      ...api,
      keys: [...api.keys, newKey]
    };

    setApis(apis.map(a => a.id === apiId ? updatedApi : a));
  };

  const handleUpdateKey = (apiId: string, keyId: string, updates: Partial<APIKey>) => {
    const updatedApis = apis.map(api => {
      if (api.id !== apiId) return api;

      return {
        ...api,
        keys: api.keys.map(key => 
          key.id === keyId ? { ...key, ...updates } : key
        )
      };
    });

    setApis(updatedApis);
  };

  const handleDeleteAPI = (apiId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta API?')) return;
    setApis(apis.filter(api => api.id !== apiId));
  };

  const toggleSecretVisibility = (keyId: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const validateAPIKeys = (api: APIConfig): string[] => {
    const errors: string[] = [];
    api.keys.forEach(key => {
      if (key.required && (!key.key || key.key === '****' || key.key.includes('...'))) {
        errors.push(`La clave "${key.name}" es requerida`);
      }
    });
    return errors;
  };

  const toggleAPIStatus = (api: APIConfig) => {
    if (api.status === 'inactive') {
      const errors = validateAPIKeys(api);
      if (errors.length > 0) {
        setValidationErrors(errors);
        setEditingAPI(api);
        setShowEditModal(true);
        return;
      }
    }

    const updatedAPI = {
      ...api,
      status: api.status === 'active' ? 'inactive' : 'active'
    };

    setApis(apis.map(a => a.id === api.id ? updatedAPI : a));
  };

  const updateAPIKey = (apiId: string, keyId: string, value: string) => {
    setApis(apis.map(api => {
      if (api.id !== apiId) return api;
      return {
        ...api,
        keys: api.keys.map(key => 
          key.id === keyId ? { ...key, key: value } : key
        )
      };
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">APIs y Servicios</h1>
            <p className="mt-2 text-sm text-gray-600">
              Gestiona las integraciones con servicios externos
            </p>
          </div>
          {hasPermission(PERMISSIONS.SETTINGS_EDIT) && (
            <button
              onClick={() => setShowNewAPIForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <FaPlus className="mr-2" />
              Agregar Nueva API
            </button>
          )}
        </div>

        {/* Formulario para Nueva API */}
        {showNewAPIForm && (
          <div className="mb-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Nueva API</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={newAPI.name || ''}
                  onChange={(e) => setNewAPI({ ...newAPI, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Nombre de la API"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <select
                  value={newAPI.category || ''}
                  onChange={(e) => setNewAPI({ ...newAPI, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={newAPI.description || ''}
                  onChange={(e) => setNewAPI({ ...newAPI, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                  placeholder="Descripción de la API"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL Base
                </label>
                <input
                  type="text"
                  value={newAPI.baseUrl || ''}
                  onChange={(e) => setNewAPI({ ...newAPI, baseUrl: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="https://api.ejemplo.com/v1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Documentación
                </label>
                <input
                  type="text"
                  value={newAPI.documentation || ''}
                  onChange={(e) => setNewAPI({ ...newAPI, documentation: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="URL de la documentación"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Autenticación
                </label>
                <select
                  value={newAPI.authType || 'bearer'}
                  onChange={(e) => setNewAPI({ ...newAPI, authType: e.target.value as APIConfig['authType'] })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="bearer">Bearer Token</option>
                  <option value="basic">Basic Auth</option>
                  <option value="apiKey">API Key</option>
                  <option value="oauth2">OAuth 2.0</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => setShowNewAPIForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddAPI}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Guardar API
              </button>
            </div>
          </div>
        )}

        {/* Modal de Edición de API */}
        {showEditModal && editingAPI && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  Configurar {editingAPI.name}
                </h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingAPI(null);
                    setValidationErrors([]);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {validationErrors.length > 0 && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="text-sm font-medium text-red-800 mb-2">
                    Por favor corrige los siguientes errores:
                  </h3>
                  <ul className="list-disc list-inside text-sm text-red-700">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-4">
                {editingAPI.keys.map(key => (
                  <div key={key.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {key.name}
                        {key.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {key.isSecret && (
                        <button
                          onClick={() => toggleSecretVisibility(key.id)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          {showSecrets[key.id] ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={key.isSecret && !showSecrets[key.id] ? "password" : "text"}
                        value={key.key}
                        onChange={(e) => updateAPIKey(editingAPI.id, key.id, e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder={`Ingresa ${key.name}`}
                      />
                    </div>
                    {key.isSecret && (
                      <p className="mt-1 text-xs text-gray-500">
                        Esta es una clave secreta. Manténla segura.
                      </p>
                    )}
                  </div>
                ))}

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingAPI(null);
                      setValidationErrors([]);
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      const errors = validateAPIKeys(editingAPI);
                      if (errors.length === 0) {
                        toggleAPIStatus(editingAPI);
                        setShowEditModal(false);
                        setEditingAPI(null);
                        setValidationErrors([]);
                      } else {
                        setValidationErrors(errors);
                      }
                    }}
                    className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Guardar y Activar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lista de APIs */}
        <div className="grid grid-cols-1 gap-6">
          {apis.map(api => (
            <div key={api.id} className="bg-white rounded-lg shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {api.name}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {api.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {hasPermission(PERMISSIONS.SETTINGS_EDIT) && (
                      <>
                        <button
                          onClick={() => {
                            setEditingAPI(api);
                            setValidationErrors([]);
                            setShowEditModal(true);
                          }}
                          className="p-2 text-gray-500 hover:text-gray-700"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => toggleAPIStatus(api)}
                          className={`px-3 py-1 rounded-full text-sm ${
                            api.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {api.status === 'active' ? 'Activo' : 'Inactivo'}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">URL Base</span>
                    <p className="mt-1">{api.baseUrl}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Categoría</span>
                    <p className="mt-1 capitalize">{api.category}</p>
                  </div>
                </div>

                {/* Claves API */}
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-medium">Claves API</h3>
                    {hasPermission(PERMISSIONS.SETTINGS_EDIT) && (
                      <button
                        onClick={() => handleAddKey(api.id)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        + Agregar Clave
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    {api.keys.map(key => (
                      <div
                        key={key.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <FaKey className="text-gray-400" />
                          <div>
                            <p className="font-medium">{key.name}</p>
                            <p className="text-sm text-gray-600">
                              {key.isSecret && !showSecrets[key.id]
                                ? '••••••••••••••••'
                                : key.key}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {key.isSecret && (
                            <button
                              onClick={() => toggleSecretVisibility(key.id)}
                              className="p-2 text-gray-500 hover:text-gray-700"
                            >
                              {showSecrets[key.id] ? <FaEyeSlash /> : <FaEye />}
                            </button>
                          )}
                          {hasPermission(PERMISSIONS.SETTINGS_EDIT) && (
                            <button
                              onClick={() => handleUpdateKey(api.id, key.id, {
                                name: prompt('Nuevo nombre para la clave:', key.name) || key.name
                              })}
                              className="p-2 text-gray-500 hover:text-gray-700"
                            >
                              <FaEdit />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Información Adicional */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Tipo de Auth</span>
                      <p className="mt-1 font-medium">{api.authType.toUpperCase()}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Creada</span>
                      <p className="mt-1 font-medium">
                        {new Date(api.created).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Última Prueba</span>
                      <p className="mt-1 font-medium">
                        {new Date(api.lastTested).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
