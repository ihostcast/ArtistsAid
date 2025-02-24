'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/Admin/Layout/DashboardLayout';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';

interface Artist {
  id: string;
  name: string;
  genre: string;
  location: string;
  price: number;
  rating: number;
  imageUrl?: string;
  createdAt: any;
}

export default function ArtistsPage() {
  const { userProfile, loading, isAdmin } = useAuth();
  const [artists, setArtists] = useState<Artist[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !userProfile) {
      router.push('/login');
      return;
    }

    if (!loading && !isAdmin()) {
      router.push('/admin');
      return;
    }

    const fetchArtists = async () => {
      try {
        const artistsCollection = collection(db, 'artists');
        const artistsSnapshot = await getDocs(artistsCollection);
        const artistsData = artistsSnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        })) as Artist[];
        setArtists(artistsData);
      } catch (error) {
        console.error('Error fetching artists:', error);
      }
    };

    fetchArtists();
  }, [loading, userProfile, router, isAdmin]);

  if (loading || !userProfile) {
    return <div>Cargando...</div>;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Gestión de Artistas</h2>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Agregar Artista
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artists.map((artist) => (
            <div key={artist.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="h-48 bg-gray-200">
                {artist.imageUrl ? (
                  <img
                    src={artist.imageUrl}
                    alt={artist.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No image
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900">{artist.name}</h3>
                <div className="mt-2 space-y-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Género:</span> {artist.genre}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Ubicación:</span> {artist.location}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Precio:</span> ${artist.price}
                  </p>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-600">Rating:</span>
                    <div className="ml-2 flex">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${
                            i < artist.rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <button className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800">
                    Editar
                  </button>
                  <button className="px-3 py-1 text-sm text-red-600 hover:text-red-800">
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
