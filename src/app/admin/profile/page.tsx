'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AdminLayout from '@/components/admin/AdminLayout';
import { FaUser, FaEnvelope, FaLock, FaBell, FaShieldAlt, FaHistory } from 'react-icons/fa';
import Image from 'next/image';

export default function ProfilePage() {
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 234 567 890',
    bio: 'Músico profesional con más de 10 años de experiencia...',
    notificationSettings: {
      email: true,
      push: true,
      sms: false,
    },
    securitySettings: {
      twoFactor: true,
      sessionTimeout: '30',
      ipWhitelist: '',
    }
  });

  const [activityLog] = useState([
    {
      action: 'Inicio de sesión',
      date: '2025-02-24T19:30:00',
      ip: '192.168.1.1',
      device: 'Chrome / MacOS',
    },
    {
      action: 'Cambio de contraseña',
      date: '2025-02-23T15:45:00',
      ip: '192.168.1.1',
      device: 'Firefox / MacOS',
    },
    {
      action: 'Actualización de perfil',
      date: '2025-02-22T10:20:00',
      ip: '192.168.1.1',
      device: 'Safari / iOS',
    },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    // Implementar actualización de perfil
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Implementar subida de imagen
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Perfil de Usuario</h1>
            <p className="mt-1 text-sm text-gray-600">
              Administra tu información personal y preferencias
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-6 border-b">
            <nav className="flex space-x-8">
              {[
                { id: 'general', label: 'General', icon: FaUser },
                { id: 'notifications', label: 'Notificaciones', icon: FaBell },
                { id: 'security', label: 'Seguridad', icon: FaShieldAlt },
                { id: 'activity', label: 'Actividad', icon: FaHistory },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center pb-4 px-1 ${
                    activeTab === id
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Contenido de las tabs */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            {/* Tab General */}
            {activeTab === 'general' && (
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <div className="flex items-center">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
                        <Image
                          src="/placeholder-avatar.png"
                          alt="Profile"
                          width={96}
                          height={96}
                          className="object-cover"
                        />
                      </div>
                      <label
                        htmlFor="avatar-upload"
                        className="absolute bottom-0 right-0 p-1 bg-white rounded-full shadow-md cursor-pointer"
                      >
                        <input
                          id="avatar-upload"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                        <FaUser className="w-4 h-4 text-gray-600" />
                      </label>
                    </div>
                    <div className="ml-6">
                      <h2 className="text-xl font-semibold">{formData.name}</h2>
                      <p className="text-sm text-gray-600">{formData.email}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!isEditing}
                      className="mt-1 block w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!isEditing}
                      className="mt-1 block w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!isEditing}
                      className="mt-1 block w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Biografía
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      disabled={!isEditing}
                      rows={4}
                      className="mt-1 block w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  {!isEditing ? (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Editar Perfil
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Guardar Cambios
                      </button>
                    </>
                  )}
                </div>
              </form>
            )}

            {/* Tab Notificaciones */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Preferencias de Notificación</h3>
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.notificationSettings.email}
                      onChange={(e) => setFormData({
                        ...formData,
                        notificationSettings: {
                          ...formData.notificationSettings,
                          email: e.target.checked
                        }
                      })}
                      className="rounded text-blue-600"
                    />
                    <span className="ml-2">Notificaciones por Email</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.notificationSettings.push}
                      onChange={(e) => setFormData({
                        ...formData,
                        notificationSettings: {
                          ...formData.notificationSettings,
                          push: e.target.checked
                        }
                      })}
                      className="rounded text-blue-600"
                    />
                    <span className="ml-2">Notificaciones Push</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.notificationSettings.sms}
                      onChange={(e) => setFormData({
                        ...formData,
                        notificationSettings: {
                          ...formData.notificationSettings,
                          sms: e.target.checked
                        }
                      })}
                      className="rounded text-blue-600"
                    />
                    <span className="ml-2">Notificaciones SMS</span>
                  </label>
                </div>
              </div>
            )}

            {/* Tab Seguridad */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium">Configuración de Seguridad</h3>
                
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.securitySettings.twoFactor}
                      onChange={(e) => setFormData({
                        ...formData,
                        securitySettings: {
                          ...formData.securitySettings,
                          twoFactor: e.target.checked
                        }
                      })}
                      className="rounded text-blue-600"
                    />
                    <span className="ml-2">Autenticación de dos factores</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tiempo de expiración de sesión (minutos)
                  </label>
                  <select
                    value={formData.securitySettings.sessionTimeout}
                    onChange={(e) => setFormData({
                      ...formData,
                      securitySettings: {
                        ...formData.securitySettings,
                        sessionTimeout: e.target.value
                      }
                    })}
                    className="mt-1 block w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="15">15 minutos</option>
                    <option value="30">30 minutos</option>
                    <option value="60">1 hora</option>
                    <option value="120">2 horas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Lista blanca de IPs (una por línea)
                  </label>
                  <textarea
                    value={formData.securitySettings.ipWhitelist}
                    onChange={(e) => setFormData({
                      ...formData,
                      securitySettings: {
                        ...formData.securitySettings,
                        ipWhitelist: e.target.value
                      }
                    })}
                    rows={4}
                    className="mt-1 block w-full px-3 py-2 border rounded-lg"
                    placeholder="192.168.1.1&#10;10.0.0.1"
                  />
                </div>

                <div>
                  <button
                    type="button"
                    className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
                  >
                    Cambiar Contraseña
                  </button>
                </div>
              </div>
            )}

            {/* Tab Actividad */}
            {activeTab === 'activity' && (
              <div>
                <h3 className="text-lg font-medium mb-4">Registro de Actividad</h3>
                <div className="space-y-4">
                  {activityLog.map((log, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{log.action}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(log.date).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{log.device}</p>
                        <p className="text-sm text-gray-600">{log.ip}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
