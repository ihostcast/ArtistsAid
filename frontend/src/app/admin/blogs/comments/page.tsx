'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import AdminLayout from '@/components/admin/AdminLayout';
import { Comment } from '@/types/blog';
import { FiMessageSquare, FiCheck, FiX, FiTrash2 } from 'react-icons/fi';

interface CommentWithBlog extends Comment {
  blogTitle: string;
  blogId: string;
}

export default function CommentsPage() {
  const [comments, setComments] = useState<CommentWithBlog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'spam'>('all');

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const q = query(collection(db, 'comments'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const commentsData: CommentWithBlog[] = [];
      
      for (const doc of querySnapshot.docs) {
        const commentData = doc.data() as Comment;
        // Obtener el título del blog
        const blogDoc = await getDocs(doc(db, 'blogs', commentData.blogId));
        const blogData = blogDoc.data();
        
        commentsData.push({
          id: doc.id,
          ...commentData,
          blogTitle: blogData?.title || 'Blog Eliminado',
          blogId: commentData.blogId
        });
      }
      
      setComments(commentsData);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Error al cargar los comentarios');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (commentId: string, status: 'approved' | 'spam') => {
    try {
      await updateDoc(doc(db, 'comments', commentId), {
        status,
        updatedAt: new Date()
      });

      setComments(prev =>
        prev.map(comment =>
          comment.id === commentId
            ? { ...comment, status }
            : comment
        )
      );
    } catch (err) {
      console.error('Error updating comment status:', err);
      setError('Error al actualizar el estado del comentario');
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este comentario?')) return;

    try {
      await deleteDoc(doc(db, 'comments', commentId));
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Error al eliminar el comentario');
    }
  };

  const filteredComments = comments.filter(comment => {
    if (filter === 'all') return true;
    return comment.status === filter;
  });

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
            <h1 className="text-3xl font-bold text-gray-800">Comentarios</h1>
            <p className="text-gray-600 mt-2">
              Gestiona los comentarios de tu blog
            </p>
          </div>
          <div className="flex space-x-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">Todos los comentarios</option>
              <option value="pending">Pendientes</option>
              <option value="approved">Aprobados</option>
              <option value="spam">Spam</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="min-w-full divide-y divide-gray-200">
            {filteredComments.map(comment => (
              <div key={comment.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <FiMessageSquare className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-medium text-gray-900">
                          {comment.authorName}
                        </h3>
                        <span className="text-sm text-gray-500">
                          en {comment.blogTitle}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {comment.authorEmail}
                      </p>
                      <p className="mt-1 text-sm text-gray-900">
                        {comment.content}
                      </p>
                      <p className="mt-2 text-xs text-gray-500">
                        {formatDate(comment.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {comment.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(comment.id, 'approved')}
                          className="p-2 text-green-600 hover:bg-green-100 rounded-full"
                          title="Aprobar"
                        >
                          <FiCheck className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleStatusChange(comment.id, 'spam')}
                          className="p-2 text-orange-600 hover:bg-orange-100 rounded-full"
                          title="Marcar como spam"
                        >
                          <FiX className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-full"
                      title="Eliminar"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                {comment.parentId && (
                  <div className="mt-4 ml-14 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">
                      En respuesta a otro comentario
                    </p>
                  </div>
                )}
              </div>
            ))}
            {filteredComments.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                No hay comentarios {filter !== 'all' ? `${filter}s` : ''} para mostrar
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
