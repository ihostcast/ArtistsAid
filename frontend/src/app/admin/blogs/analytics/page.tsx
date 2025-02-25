'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, where } from 'firebase/firestore';
import { db } from '@/config/firebase';
import AdminLayout from '@/components/admin/AdminLayout';
import { Blog } from '@/types/blog';
import { Line, Bar, Pie } from 'react-chartjs-2';
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
import { FiTrendingUp, FiUsers, FiMessageSquare, FiShare2 } from 'react-icons/fi';

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

interface BlogAnalytics extends Blog {
  analytics: {
    views: number[];
    likes: number[];
    shares: number[];
    comments: number[];
    dates: string[];
  };
}

interface AnalyticsSummary {
  totalViews: number;
  totalLikes: number;
  totalShares: number;
  totalComments: number;
  mostViewedPosts: BlogAnalytics[];
  mostLikedPosts: BlogAnalytics[];
  mostCommentedPosts: BlogAnalytics[];
  viewsByCategory: { [key: string]: number };
  engagementRate: number;
}

export default function BlogAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const startDate = new Date();
      switch (timeRange) {
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }

      const q = query(
        collection(db, 'blogs'),
        where('createdAt', '>=', startDate),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const blogs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BlogAnalytics[];

      // Calcular resumen de analytics
      const summary: AnalyticsSummary = {
        totalViews: blogs.reduce((sum, blog) => sum + (blog.meta?.views || 0), 0),
        totalLikes: blogs.reduce((sum, blog) => sum + (blog.meta?.likes || 0), 0),
        totalShares: blogs.reduce((sum, blog) => sum + (blog.meta?.shares || 0), 0),
        totalComments: blogs.reduce((sum, blog) => sum + (blog.comments?.length || 0), 0),
        mostViewedPosts: [...blogs].sort((a, b) => (b.meta?.views || 0) - (a.meta?.views || 0)).slice(0, 5),
        mostLikedPosts: [...blogs].sort((a, b) => (b.meta?.likes || 0) - (a.meta?.likes || 0)).slice(0, 5),
        mostCommentedPosts: [...blogs].sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0)).slice(0, 5),
        viewsByCategory: blogs.reduce((acc, blog) => {
          blog.categories.forEach(cat => {
            acc[cat.name] = (acc[cat.name] || 0) + (blog.meta?.views || 0);
          });
          return acc;
        }, {} as { [key: string]: number }),
        engagementRate: calculateEngagementRate(blogs)
      };

      setAnalytics(summary);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Error al cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const calculateEngagementRate = (blogs: BlogAnalytics[]): number => {
    const totalViews = blogs.reduce((sum, blog) => sum + (blog.meta?.views || 0), 0);
    const totalEngagements = blogs.reduce((sum, blog) => 
      sum + (blog.meta?.likes || 0) + (blog.meta?.shares || 0) + (blog.comments?.length || 0), 0
    );
    return totalViews > 0 ? (totalEngagements / totalViews) * 100 : 0;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Estadísticas del Blog</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setTimeRange('week')}
              className={`px-4 py-2 rounded-md ${
                timeRange === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 text-gray-700'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-4 py-2 rounded-md ${
                timeRange === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 text-gray-700'
              }`}
            >
              Mes
            </button>
            <button
              onClick={() => setTimeRange('year')}
              className={`px-4 py-2 rounded-md ${
                timeRange === 'year'
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 text-gray-700'
              }`}
            >
              Año
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {analytics && (
          <>
            {/* Resumen de Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <FiTrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Vistas Totales</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {analytics.totalViews.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-full">
                    <FiUsers className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Me Gusta</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {analytics.totalLikes.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <FiMessageSquare className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Comentarios</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {analytics.totalComments.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-orange-100 rounded-full">
                    <FiShare2 className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Compartidos</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {analytics.totalShares.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Vistas por Categoría
                </h2>
                <Pie
                  data={{
                    labels: Object.keys(analytics.viewsByCategory),
                    datasets: [
                      {
                        data: Object.values(analytics.viewsByCategory),
                        backgroundColor: [
                          '#3B82F6',
                          '#10B981',
                          '#F59E0B',
                          '#EF4444',
                          '#8B5CF6',
                          '#EC4899'
                        ]
                      }
                    ]
                  }}
                  options={{
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }}
                />
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Engagement Rate
                </h2>
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <p className="text-5xl font-bold text-blue-600">
                      {analytics.engagementRate.toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-500 mt-2">Tasa de Engagement</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Posts Más Populares */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Posts Más Vistos
                </h2>
                <div className="space-y-4">
                  {analytics.mostViewedPosts.map((post, index) => (
                    <div key={post.id} className="flex items-center">
                      <span className="text-2xl font-bold text-gray-300 mr-4">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {post.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {post.meta?.views.toLocaleString()} vistas
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Posts Más Gustados
                </h2>
                <div className="space-y-4">
                  {analytics.mostLikedPosts.map((post, index) => (
                    <div key={post.id} className="flex items-center">
                      <span className="text-2xl font-bold text-gray-300 mr-4">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {post.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {post.meta?.likes.toLocaleString()} me gusta
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Posts Más Comentados
                </h2>
                <div className="space-y-4">
                  {analytics.mostCommentedPosts.map((post, index) => (
                    <div key={post.id} className="flex items-center">
                      <span className="text-2xl font-bold text-gray-300 mr-4">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {post.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {post.comments?.length || 0} comentarios
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
