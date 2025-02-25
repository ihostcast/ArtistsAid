'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/hooks/useAuth';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import AdminLayout from '@/components/admin/AdminLayout';
import { Blog, Category, Tag } from '@/types/blog';
import { slugify } from '@/utils/slugify';
import { FiImage, FiSave, FiX } from 'react-icons/fi';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function CreateBlog() {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [formData, setFormData] = useState<Partial<Blog>>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    status: 'draft',
    featuredImage: {
      url: '',
      alt: '',
      caption: ''
    },
    categories: [],
    tags: [],
    meta: {
      views: 0,
      likes: 0,
      shares: 0,
      readingTime: 0,
      featured: false,
      pinned: false
    },
    seo: {
      title: '',
      description: '',
      keywords: [],
      ogImage: '',
      ogDescription: '',
      twitterCard: 'summary_large_image'
    }
  });

  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, []);

  const fetchCategories = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'categories'));
      const categoriesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Category[];
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchTags = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'tags'));
      const tagsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Tag[];
      setTags(tagsData);
    } catch (err) {
      console.error('Error fetching tags:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Generar slug automáticamente cuando se escribe el título
    if (name === 'title') {
      setFormData(prev => ({
        ...prev,
        slug: slugify(value),
        seo: {
          ...prev.seo!,
          title: value
        }
      }));
    }
  };

  const handleEditorChange = (content: string) => {
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200); // Estimado de 200 palabras por minuto

    setFormData(prev => ({
      ...prev,
      content,
      meta: {
        ...prev.meta!,
        readingTime
      }
    }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => {
      const category = categories.find(cat => cat.id === option.value);
      return category!;
    });
    setFormData(prev => ({
      ...prev,
      categories: selectedOptions
    }));
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tagNames = e.target.value.split(',').map(tag => tag.trim());
    const validTags = tagNames.map(tagName => {
      const existingTag = tags.find(t => t.name.toLowerCase() === tagName.toLowerCase());
      return existingTag || {
        name: tagName,
        slug: slugify(tagName)
      };
    });

    setFormData(prev => ({
      ...prev,
      tags: validTags
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Debes estar autenticado para crear un blog');
      return;
    }

    if (!formData.title?.trim() || !formData.content?.trim()) {
      setError('El título y el contenido son obligatorios');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const blogData = {
        ...formData,
        author: {
          id: user.uid,
          name: user.displayName || 'Usuario Anónimo',
          email: user.email!
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        publishedAt: formData.status === 'published' ? serverTimestamp() : null
      };

      const docRef = await addDoc(collection(db, 'blogs'), blogData);
      
      router.push('/admin/blogs');
    } catch (err) {
      console.error('Error al crear el blog:', err);
      setError('Error al crear el blog. Por favor, intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Crear Nuevo Blog</h1>
          <div className="space-x-4">
            <button
              type="button"
              onClick={() => router.push('/admin/blogs')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <FiSave className="mr-2" />
              {isSubmitting ? 'Guardando...' : 'Publicar'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="mb-6">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Título
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-6">
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                  URL Amigable (Slug)
                </label>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-6">
                <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">
                  Extracto
                </label>
                <textarea
                  id="excerpt"
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Contenido
                </label>
                <div className="prose max-w-none">
                  <ReactQuill
                    value={formData.content}
                    onChange={handleEditorChange}
                    className="h-96 mb-12"
                    theme="snow"
                    modules={{
                      toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        [{ 'align': [] }],
                        ['link', 'image'],
                        ['clean']
                      ]
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Publicación</h3>
              
              <div className="mb-4">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Estado
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="draft">Borrador</option>
                  <option value="published">Publicado</option>
                  <option value="private">Privado</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Opciones
                </label>
                <div className="mt-2 space-y-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.meta?.featured}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        meta: { ...prev.meta!, featured: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">Destacado</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.meta?.pinned}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        meta: { ...prev.meta!, pinned: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">Fijar en inicio</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Categorías y Tags</h3>
              
              <div className="mb-4">
                <label htmlFor="categories" className="block text-sm font-medium text-gray-700">
                  Categorías
                </label>
                <select
                  id="categories"
                  multiple
                  value={formData.categories?.map(cat => cat.id)}
                  onChange={handleCategoryChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  size={5}
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                  Tags
                </label>
                <input
                  type="text"
                  id="tags"
                  value={formData.tags?.map(tag => tag.name).join(', ')}
                  onChange={handleTagsChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Separados por comas"
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">SEO</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="seoTitle" className="block text-sm font-medium text-gray-700">
                    Título SEO
                  </label>
                  <input
                    type="text"
                    id="seoTitle"
                    value={formData.seo?.title}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      seo: { ...prev.seo!, title: e.target.value }
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="seoDescription" className="block text-sm font-medium text-gray-700">
                    Descripción Meta
                  </label>
                  <textarea
                    id="seoDescription"
                    value={formData.seo?.description}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      seo: { ...prev.seo!, description: e.target.value }
                    }))}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="seoKeywords" className="block text-sm font-medium text-gray-700">
                    Palabras Clave
                  </label>
                  <input
                    type="text"
                    id="seoKeywords"
                    value={formData.seo?.keywords?.join(', ')}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      seo: { 
                        ...prev.seo!, 
                        keywords: e.target.value.split(',').map(k => k.trim()) 
                      }
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Separadas por comas"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
