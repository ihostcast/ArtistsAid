'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, orderBy, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import AdminLayout from '@/components/admin/AdminLayout';
import { Blog, BlogRevision } from '@/types/blog';
import { FiClock, FiRotateCcw, FiEye } from 'react-icons/fi';
import ReactDiffViewer from 'react-diff-viewer';

interface Props {
  params: {
    id: string;
  };
}

export default function BlogRevisions({ params }: Props) {
  const router = useRouter();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [revisions, setRevisions] = useState<BlogRevision[]>([]);
  const [selectedRevision, setSelectedRevision] = useState<BlogRevision | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comparing, setComparing] = useState(false);

  useEffect(() => {
    fetchBlogAndRevisions();
  }, [params.id]);

  const fetchBlogAndRevisions = async () => {
    try {
      // Obtener el blog
      const blogDoc = await getDoc(doc(db, 'blogs', params.id));
      if (!blogDoc.exists()) {
        setError('Blog no encontrado');
        return;
      }
      setBlog({ id: blogDoc.id, ...blogDoc.data() } as Blog);

      // Obtener las revisiones
      const q = query(
        collection(db, 'blogRevisions'),
        where('blogId', '==', params.id),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const revisionsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BlogRevision[];
      setRevisions(revisionsData);
    } catch (err) {
      console.error('Error fetching blog and revisions:', err);
      setError('Error al cargar las revisiones');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreRevision = async (revision: BlogRevision) => {
    if (!confirm('¿Estás seguro de que quieres restaurar esta versión?')) return;

    try {
      // Crear una nueva revisión con el contenido actual
      const currentRevision = {
        blogId: blog!.id,
        content: blog!.content,
        title: blog!.title,
        excerpt: blog!.excerpt,
        author: blog!.author,
        createdAt: new Date()
      };

      await updateDoc(doc(db, 'blogs', params.id), {
        content: revision.content,
        title: revision.title,
        excerpt: revision.excerpt,
        updatedAt: new Date()
      });

      // Actualizar la lista de revisiones
      fetchBlogAndRevisions();
    } catch (err) {
      console.error('Error restoring revision:', err);
      setError('Error al restaurar la revisión');
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
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
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Historial de Revisiones</h1>
            <p className="text-gray-600 mt-2">
              {blog?.title}
            </p>
          </div>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Volver
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Revisiones</h2>
              <div className="space-y-4">
                {revisions.map((revision) => (
                  <div
                    key={revision.id}
                    className={`p-4 rounded-lg border ${
                      selectedRevision?.id === revision.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    } cursor-pointer`}
                    onClick={() => setSelectedRevision(revision)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FiClock className="text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {formatDate(revision.createdAt)}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRestoreRevision(revision);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FiRotateCcw className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        Por {revision.author.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedRevision ? (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-medium text-gray-900">
                    Revisión del {formatDate(selectedRevision.createdAt)}
                  </h2>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setComparing(!comparing)}
                      className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      <FiEye className="mr-2" />
                      {comparing ? 'Ver Contenido' : 'Comparar Cambios'}
                    </button>
                    <button
                      onClick={() => handleRestoreRevision(selectedRevision)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Restaurar Esta Versión
                    </button>
                  </div>
                </div>

                {comparing ? (
                  <ReactDiffViewer
                    oldValue={blog?.content || ''}
                    newValue={selectedRevision.content}
                    splitView={true}
                    leftTitle="Versión Actual"
                    rightTitle="Versión Seleccionada"
                  />
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Título</h3>
                      <p className="mt-1 text-sm text-gray-900">{selectedRevision.title}</p>
                    </div>
                    {selectedRevision.excerpt && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-700">Extracto</h3>
                        <p className="mt-1 text-sm text-gray-900">{selectedRevision.excerpt}</p>
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Contenido</h3>
                      <div
                        className="mt-1 prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: selectedRevision.content }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                <p className="text-gray-500">
                  Selecciona una revisión para ver los detalles
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
