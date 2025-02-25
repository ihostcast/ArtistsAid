'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/hooks/useAuth';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { FaUsers, FaCalendarAlt, FaMusic, FaDollarSign, FaChartLine } from 'react-icons/fa';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function DashboardPage() {
  const { userProfile } = useAuth();
  const [timeRange, setTimeRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(true);

  // Datos de ejemplo para las métricas
  const [metrics, setMetrics] = useState({
    totalUsers: 1250,
    activeUsers: 856,
    totalEvents: 45,
    upcomingEvents: 12,
    totalTracks: 328,
    totalRevenue: 15780.50,
    revenueGrowth: 23.5,
    userGrowth: 15.8
  });

  // Datos para el gráfico de ingresos
  const revenueData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Ingresos',
        data: [3000, 3500, 4200, 4800, 5100, 5600, 6200],
        fill: true,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4
      }
    ]
  };

  // Datos para el gráfico de usuarios
  const userData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Nuevos Usuarios',
        data: [120, 150, 180, 220, 250, 280, 310],
        backgroundColor: 'rgba(54, 162, 235, 0.8)'
      }
    ]
  };

  // Datos para el gráfico de distribución de contenido
  const contentDistributionData = {
    labels: ['Música', 'Eventos', 'Posts', 'Fotos'],
    datasets: [
      {
        data: [328, 45, 156, 234],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)'
        ]
      }
    ]
  };

  // Opciones comunes para los gráficos
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const
      }
    }
  };

  useEffect(() => {
    // Simular carga de datos
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Dashboard</h1>
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">
              Bienvenido de nuevo, {userProfile?.name}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border rounded-lg bg-white shadow-sm"
            >
              <option value="7d">Últimos 7 días</option>
              <option value="30d">Últimos 30 días</option>
              <option value="90d">Últimos 90 días</option>
              <option value="1y">Este año</option>
            </select>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Descargar Reporte
            </button>
          </div>
        </div>

        {/* Métricas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Usuarios */}
          <div className="bg-white rounded-lg shadow-lg p-6 flex items-center">
            <div className="bg-blue-500 rounded-full p-4 mr-4 text-white">
              <FaUsers className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-gray-500 text-sm">Total Usuarios</h3>
              <p className="text-2xl font-bold text-gray-800">{metrics.totalUsers}</p>
            </div>
          </div>

          {/* Eventos */}
          <div className="bg-white rounded-lg shadow-lg p-6 flex items-center">
            <div className="bg-purple-500 rounded-full p-4 mr-4 text-white">
              <FaCalendarAlt className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-gray-500 text-sm">Total Eventos</h3>
              <p className="text-2xl font-bold text-gray-800">{metrics.totalEvents}</p>
            </div>
          </div>

          {/* Pistas */}
          <div className="bg-white rounded-lg shadow-lg p-6 flex items-center">
            <div className="bg-pink-500 rounded-full p-4 mr-4 text-white">
              <FaMusic className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-gray-500 text-sm">Total Pistas</h3>
              <p className="text-2xl font-bold text-gray-800">{metrics.totalTracks}</p>
            </div>
          </div>

          {/* Ingresos */}
          <div className="bg-white rounded-lg shadow-lg p-6 flex items-center">
            <div className="bg-yellow-500 rounded-full p-4 mr-4 text-white">
              <FaDollarSign className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-gray-500 text-sm">Ingresos Totales</h3>
              <p className="text-2xl font-bold text-gray-800">${metrics.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gráfico de Ingresos */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-center">Tendencia de Ingresos</h2>
            <Line data={revenueData} options={chartOptions} />
          </div>

          {/* Gráfico de Usuarios */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-center">Nuevos Usuarios</h2>
            <Bar data={userData} options={chartOptions} />
          </div>
        </div>

        {/* Fila Inferior */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Distribución de Contenido */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-center">Distribución de Contenido</h2>
            <div className="w-3/4 mx-auto">
              <Doughnut data={contentDistributionData} options={chartOptions} />
            </div>
          </div>

          {/* Actividad Reciente */}
          <div className="col-span-2 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-center">Actividad Reciente</h2>
            <div className="space-y-4">
              {[
                { type: 'user', text: 'Nuevo usuario registrado: María González', time: '5 min' },
                { type: 'event', text: 'Nuevo evento creado: Concierto en vivo', time: '15 min' },
                { type: 'track', text: 'Nueva pista subida: Summer Vibes', time: '1 hora' },
                { type: 'payment', text: 'Pago recibido: $150.00', time: '2 horas' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      activity.type === 'user' ? 'bg-blue-100 text-blue-600' :
                      activity.type === 'event' ? 'bg-purple-100 text-purple-600' :
                      activity.type === 'track' ? 'bg-pink-100 text-pink-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {activity.type === 'user' ? <FaUsers className="w-4 h-4" /> :
                       activity.type === 'event' ? <FaCalendarAlt className="w-4 h-4" /> :
                       activity.type === 'track' ? <FaMusic className="w-4 h-4" /> :
                       <FaDollarSign className="w-4 h-4" />}
                    </div>
                    <span className="text-sm text-gray-700">{activity.text}</span>
                  </div>
                  <span className="text-xs text-gray-500">Hace {activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
