'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import AdminLayout from '@/components/admin/AdminLayout';
import { PERMISSIONS } from '@/types/roles';
import { FaDownload, FaUpload, FaTrash, FaHistory } from 'react-icons/fa';

interface Backup {
  id: string;
  name: string;
  size: string;
  type: 'manual' | 'automatic';
  created: string;
  status: 'completed' | 'in_progress' | 'failed';
  items: {
    database: boolean;
    files: boolean;
    settings: boolean;
    users: boolean;
  };
}

export default function BackupsPage() {
  const { userProfile } = useAuth();
  const { hasPermission } = usePermissions();
  const [backups, setBackups] = useState<Backup[]>([
    {
      id: '1',
      name: 'Backup_2025_02_24_18_00',
      size: '256MB',
      type: 'automatic',
      created: '2025-02-24T18:00:00',
      status: 'completed',
      items: {
        database: true,
        files: true,
        settings: true,
        users: true
      }
    }
  ]);

  const [backupInProgress, setBackupInProgress] = useState(false);
  const [selectedItems, setSelectedItems] = useState({
    database: true,
    files: true,
    settings: true,
    users: true
  });

  const createBackup = async () => {
    if (!hasPermission(PERMISSIONS.BACKUP_CREATE)) return;
    
    setBackupInProgress(true);
    const newBackup: Backup = {
      id: Date.now().toString(),
      name: `Backup_${new Date().toISOString().split('T')[0].replace(/-/g, '_')}_${new Date().getHours()}_${new Date().getMinutes()}`,
      size: 'Calculando...',
      type: 'manual',
      created: new Date().toISOString(),
      status: 'in_progress',
      items: selectedItems
    };

    setBackups([newBackup, ...backups]);

    // Simular proceso de backup
    setTimeout(() => {
      setBackups(prev => prev.map(b => 
        b.id === newBackup.id 
          ? { ...b, status: 'completed', size: '128MB' }
          : b
      ));
      setBackupInProgress(false);
    }, 5000);
  };

  const deleteBackup = (id: string) => {
    if (!hasPermission(PERMISSIONS.BACKUP_DELETE)) return;
    if (!confirm('¿Estás seguro de que deseas eliminar este backup?')) return;
    setBackups(backups.filter(b => b.id !== id));
  };

  const restoreBackup = (backup: Backup) => {
    if (!hasPermission(PERMISSIONS.BACKUP_RESTORE)) return;
    if (!confirm('¿Estás seguro de que deseas restaurar este backup? Esta acción no se puede deshacer.')) return;
    // Implementar restauración
  };

  if (!hasPermission(PERMISSIONS.BACKUP_VIEW)) {
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
            <h1 className="text-2xl font-bold text-gray-900">Copias de Seguridad</h1>
            <p className="mt-2 text-sm text-gray-600">
              Gestiona las copias de seguridad de tu sistema
            </p>
          </div>
          <button
            onClick={createBackup}
            disabled={backupInProgress || !hasPermission(PERMISSIONS.BACKUP_CREATE)}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
              backupInProgress || !hasPermission(PERMISSIONS.BACKUP_CREATE)
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <FaUpload />
            <span>{backupInProgress ? 'Creando backup...' : 'Crear Backup'}</span>
          </button>
        </div>

        {/* Configuración de Backup */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Configuración de Backup</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedItems.database}
                onChange={(e) => setSelectedItems({
                  ...selectedItems,
                  database: e.target.checked
                })}
                className="rounded text-blue-600"
              />
              <span>Base de datos</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedItems.files}
                onChange={(e) => setSelectedItems({
                  ...selectedItems,
                  files: e.target.checked
                })}
                className="rounded text-blue-600"
              />
              <span>Archivos</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedItems.settings}
                onChange={(e) => setSelectedItems({
                  ...selectedItems,
                  settings: e.target.checked
                })}
                className="rounded text-blue-600"
              />
              <span>Configuración</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedItems.users}
                onChange={(e) => setSelectedItems({
                  ...selectedItems,
                  users: e.target.checked
                })}
                className="rounded text-blue-600"
              />
              <span>Usuarios</span>
            </label>
          </div>
        </div>

        {/* Lista de Backups */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tamaño
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {backups.map((backup) => (
                <tr key={backup.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {backup.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{backup.size}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      backup.type === 'automatic'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {backup.type === 'automatic' ? 'Automático' : 'Manual'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(backup.created).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      backup.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : backup.status === 'in_progress'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {backup.status === 'completed' ? 'Completado' :
                       backup.status === 'in_progress' ? 'En Progreso' : 'Error'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {backup.status === 'completed' && (
                      <>
                        <button
                          onClick={() => restoreBackup(backup)}
                          disabled={!hasPermission(PERMISSIONS.BACKUP_RESTORE)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <FaHistory className="inline mr-1" />
                          Restaurar
                        </button>
                        <button
                          onClick={() => {}}
                          className="text-green-600 hover:text-green-900"
                        >
                          <FaDownload className="inline mr-1" />
                          Descargar
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => deleteBackup(backup.id)}
                      disabled={!hasPermission(PERMISSIONS.BACKUP_DELETE)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FaTrash className="inline mr-1" />
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
