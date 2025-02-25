'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import AdminLayout from '@/components/admin/AdminLayout';
import { PERMISSIONS } from '@/types/roles';

interface PaymentConfig {
  stripe: {
    liveMode: boolean;
    commissionRate: number;
    supportedCurrencies: string[];
  };
  paypal: {
    liveMode: boolean;
    commissionRate: number;
    supportedCurrencies: string[];
    clientId: string;
    clientSecret: string;
  };
  general: {
    minimumPayout: number;
    payoutSchedule: 'weekly' | 'biweekly' | 'monthly';
    automaticPayouts: boolean;
    defaultCurrency: string;
  };
}

export default function FinanceSettingsPage() {
  const { userProfile } = useAuth();
  const { hasPermission, canManageFinance } = usePermissions();

  const [config, setConfig] = useState<PaymentConfig>({
    stripe: {
      liveMode: false,
      commissionRate: 10,
      supportedCurrencies: ['USD', 'EUR', 'GBP']
    },
    paypal: {
      liveMode: false,
      commissionRate: 10,
      supportedCurrencies: ['USD', 'EUR', 'GBP'],
      clientId: '',
      clientSecret: ''
    },
    general: {
      minimumPayout: 50,
      payoutSchedule: 'monthly',
      automaticPayouts: true,
      defaultCurrency: 'USD'
    }
  });

  if (!canManageFinance()) {
    return (
      <AdminLayout>
        <div className="p-4">
          <h1 className="text-2xl font-bold text-red-600">
            Acceso Restringido
          </h1>
          <p className="mt-2">
            No tienes permisos para acceder a la configuración financiera.
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Configuración Financiera</h1>
          <p className="mt-2 text-sm text-gray-600">
            Gestiona la configuración de pagos y comisiones
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Configuración de Stripe */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Configuración de Stripe</h2>
              <span className={`px-2 py-1 text-xs rounded-full ${
                config.stripe.liveMode 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {config.stripe.liveMode ? 'Producción' : 'Pruebas'}
              </span>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Modo</span>
                <button
                  onClick={() => setConfig({
                    ...config,
                    stripe: {...config.stripe, liveMode: !config.stripe.liveMode}
                  })}
                  className={`px-4 py-2 rounded-lg ${
                    config.stripe.liveMode
                      ? 'bg-green-600 text-white'
                      : 'bg-yellow-600 text-white'
                  }`}
                  disabled={!hasPermission(PERMISSIONS.PAYMENT_CONFIG)}
                >
                  {config.stripe.liveMode ? 'Producción' : 'Pruebas'}
                </button>
              </div>
              
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Comisión (%)
                </label>
                <input
                  type="number"
                  value={config.stripe.commissionRate}
                  onChange={(e) => setConfig({
                    ...config,
                    stripe: {...config.stripe, commissionRate: Number(e.target.value)}
                  })}
                  className="w-full px-3 py-2 border rounded-lg"
                  disabled={!hasPermission(PERMISSIONS.PAYMENT_CONFIG)}
                />
              </div>
            </div>
          </div>

          {/* Configuración de PayPal */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Configuración de PayPal</h2>
              <span className={`px-2 py-1 text-xs rounded-full ${
                config.paypal.liveMode 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {config.paypal.liveMode ? 'Producción' : 'Pruebas'}
              </span>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Modo</span>
                <button
                  onClick={() => setConfig({
                    ...config,
                    paypal: {...config.paypal, liveMode: !config.paypal.liveMode}
                  })}
                  className={`px-4 py-2 rounded-lg ${
                    config.paypal.liveMode
                      ? 'bg-green-600 text-white'
                      : 'bg-yellow-600 text-white'
                  }`}
                  disabled={!hasPermission(PERMISSIONS.PAYMENT_CONFIG)}
                >
                  {config.paypal.liveMode ? 'Producción' : 'Pruebas'}
                </button>
              </div>
              
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Comisión (%)
                </label>
                <input
                  type="number"
                  value={config.paypal.commissionRate}
                  onChange={(e) => setConfig({
                    ...config,
                    paypal: {...config.paypal, commissionRate: Number(e.target.value)}
                  })}
                  className="w-full px-3 py-2 border rounded-lg"
                  disabled={!hasPermission(PERMISSIONS.PAYMENT_CONFIG)}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Client ID
                </label>
                <input
                  type="text"
                  value={config.paypal.clientId}
                  onChange={(e) => setConfig({
                    ...config,
                    paypal: {...config.paypal, clientId: e.target.value}
                  })}
                  className="w-full px-3 py-2 border rounded-lg"
                  disabled={!hasPermission(PERMISSIONS.PAYMENT_CONFIG)}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Client Secret
                </label>
                <input
                  type="password"
                  value={config.paypal.clientSecret}
                  onChange={(e) => setConfig({
                    ...config,
                    paypal: {...config.paypal, clientSecret: e.target.value}
                  })}
                  className="w-full px-3 py-2 border rounded-lg"
                  disabled={!hasPermission(PERMISSIONS.PAYMENT_CONFIG)}
                />
              </div>
            </div>
          </div>

          {/* Configuración General de Pagos */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Configuración General</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Pago Mínimo ($)
                </label>
                <input
                  type="number"
                  value={config.general.minimumPayout}
                  onChange={(e) => setConfig({
                    ...config,
                    general: {...config.general, minimumPayout: Number(e.target.value)}
                  })}
                  className="w-full px-3 py-2 border rounded-lg"
                  disabled={!hasPermission(PERMISSIONS.PAYMENT_CONFIG)}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Frecuencia de Pagos
                </label>
                <select
                  value={config.general.payoutSchedule}
                  onChange={(e) => setConfig({
                    ...config,
                    general: {...config.general, payoutSchedule: e.target.value as any}
                  })}
                  className="w-full px-3 py-2 border rounded-lg"
                  disabled={!hasPermission(PERMISSIONS.PAYMENT_CONFIG)}
                >
                  <option value="weekly">Semanal</option>
                  <option value="biweekly">Quincenal</option>
                  <option value="monthly">Mensual</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Moneda por Defecto
                </label>
                <select
                  value={config.general.defaultCurrency}
                  onChange={(e) => setConfig({
                    ...config,
                    general: {...config.general, defaultCurrency: e.target.value}
                  })}
                  className="w-full px-3 py-2 border rounded-lg"
                  disabled={!hasPermission(PERMISSIONS.PAYMENT_CONFIG)}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.general.automaticPayouts}
                  onChange={(e) => setConfig({
                    ...config,
                    general: {...config.general, automaticPayouts: e.target.checked}
                  })}
                  className="h-4 w-4 text-blue-600"
                  disabled={!hasPermission(PERMISSIONS.PAYMENT_CONFIG)}
                />
                <label className="ml-2 text-sm text-gray-700">
                  Habilitar pagos automáticos
                </label>
              </div>
            </div>
          </div>

          {/* Monedas Soportadas */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Monedas Soportadas</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Stripe</h3>
                <div className="flex flex-wrap gap-2">
                  {config.stripe.supportedCurrencies.map((currency) => (
                    <span
                      key={currency}
                      className="px-2 py-1 bg-gray-100 rounded-full text-sm"
                    >
                      {currency}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">PayPal</h3>
                <div className="flex flex-wrap gap-2">
                  {config.paypal.supportedCurrencies.map((currency) => (
                    <span
                      key={currency}
                      className="px-2 py-1 bg-gray-100 rounded-full text-sm"
                    >
                      {currency}
                    </span>
                  ))}
                </div>
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
            disabled={!hasPermission(PERMISSIONS.PAYMENT_CONFIG)}
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
