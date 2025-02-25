'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/admin/Layout/DashboardLayout';
import { collection, query, orderBy, getDocs, Timestamp, addDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Blog } from '@/types/blog';
import { PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';

interface Blog {
  id: string;
  title: string;
  content: string;
  status: string;
  createdAt: any;
  authorName: string;
}

export default function BlogsPage() {
  const { userProfile, loading } = useAuth();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchBlogs = async () => {
      if (loading) return;

      if (!userProfile) {
        router.push('/login');
        return;
      }

      try {
        console.log('Fetching blogs as', userProfile.role);
        const blogsCollection = collection(db, 'blogs');
        const blogsQuery = query(blogsCollection, orderBy('createdAt', 'desc'));
        const blogsSnapshot = await getDocs(blogsQuery);
        
        const blogsData = blogsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt instanceof Timestamp ? 
            doc.data().createdAt.toDate() : 
            new Date(doc.data().createdAt),
          updatedAt: doc.data().updatedAt instanceof Timestamp ? 
            doc.data().updatedAt.toDate() : 
            new Date(doc.data().updatedAt),
        } as Blog));

        setBlogs(blogsData);
        setError(null);
      } catch (error: any) {
        console.error('Error fetching blogs:', error);
        setError('Error al cargar los blogs: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogs();
  }, [loading, userProfile, router]);

  const createTestBlog = async () => {
    try {
      const blogsCollection = collection(db, 'blogs');
      const testBlog = {
        title: 'Blog de prueba',
        content: 'Este es un blog de prueba',
        status: 'draft',
        author: {
          uid: userProfile?.uid,
          name: userProfile?.displayName || 'Admin',
          email: userProfile?.email
        },
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      console.log('Creating test blog as', userProfile?.role);
      const docRef = await addDoc(blogsCollection, testBlog);
      console.log('Test blog created with ID:', docRef.id);

      // Recargar la página para mostrar el nuevo blog
      window.location.reload();
    } catch (error: any) {
      console.error('Error creating test blog:', error);
      setError('Error al crear blog: ' + error.message);
    }
  };

  if (loading || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!userProfile) {
    router.push('/login');
    return null;
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Gestión de Blogs
          </h1>
          <div className="space-x-4">
            <button
              onClick={createTestBlog}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Crear Blog de Prueba
            </button>
            <Link
              href="/admin/blogs/create"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <FiPlus className="mr-2" />
              Nuevo Blog
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Intentar de nuevo
            </button>
          </div>
        )}

        {blogs.length === 0 && !error ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No hay blogs disponibles. Crea uno nuevo para empezar.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Título
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Autor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {blogs.map((blog) => (
                  <tr key={blog.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {blog.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-300">
                        {blog.author.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        blog.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {blog.status === 'published' ? 'Publicado' : 'Borrador'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {blog.createdAt.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/admin/blogs/${blog.id}`}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                      >
                        <EyeIcon className="inline-block" />
                      </Link>
                      <Link
                        href={`/admin/blogs/${blog.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4"
                      >
                        <FiEdit className="inline-block" />
                      </Link>
                      {userProfile.role === 'superadmin' && (
                        <button
                          onClick={() => {
                            if (confirm('¿Estás seguro de que quieres eliminar este blog?')) {
                              // Implementar lógica de eliminación
                            }
                          }}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <FiTrash2 className="inline-block" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
