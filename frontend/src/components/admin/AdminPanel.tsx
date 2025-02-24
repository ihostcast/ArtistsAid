'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Artist, Event } from '@/types/firestore';
import { ArtistService, EventService } from '@/utils/firestore';
import { Timestamp } from 'firebase/firestore';

export default function AdminPanel() {
  const { userProfile } = useAuth();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [artistForm, setArtistForm] = useState({
    name: '',
    genres: '',
    bio: '',
    socialLinks: {
      spotify: '',
      instagram: '',
      twitter: ''
    }
  });

  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    location: {
      address: '',
      city: '',
      country: ''
    },
    artistId: ''
  });

  useEffect(() => {
    console.log('AdminPanel mounted, userProfile:', userProfile);
    if (!userProfile) {
      console.log('No user profile');
      setLoading(false);
      return;
    }
    
    if (userProfile.role !== 'admin') {
      console.log('User is not admin:', userProfile.email);
      setError('No tienes permisos de administrador');
      setLoading(false);
      return;
    }

    console.log('Loading data for admin user:', userProfile.email);
    loadData();
  }, [userProfile]);

  const loadData = async () => {
    try {
      console.log('Loading data...');
      setLoading(true);
      setError(null);
      
      const [artistsData, eventsData] = await Promise.all([
        ArtistService.getAll(),
        EventService.getAll()
      ]);
      console.log('Data loaded:', { artists: artistsData, events: eventsData });
      setArtists(artistsData);
      setEvents(eventsData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Error cargando datos: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateArtist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    try {
      setError(null);
      const newArtist: Omit<Artist, 'id'> = {
        name: artistForm.name,
        genres: artistForm.genres.split(',').map(g => g.trim()),
        bio: artistForm.bio,
        socialLinks: artistForm.socialLinks,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: userProfile.uid
      };

      await ArtistService.create(newArtist);
      setArtistForm({
        name: '',
        genres: '',
        bio: '',
        socialLinks: {
          spotify: '',
          instagram: '',
          twitter: ''
        }
      });
      loadData();
    } catch (err) {
      setError('Error creando artista: ' + (err instanceof Error ? err.message : 'Error desconocido'));
      console.error('Error creating artist:', err);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    try {
      setError(null);
      const newEvent: Omit<Event, 'id'> = {
        title: eventForm.title,
        description: eventForm.description,
        date: Timestamp.fromDate(new Date(eventForm.date)),
        location: eventForm.location,
        artistId: eventForm.artistId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: userProfile.uid
      };

      await EventService.create(newEvent);
      setEventForm({
        title: '',
        description: '',
        date: '',
        location: {
          address: '',
          city: '',
          country: ''
        },
        artistId: ''
      });
      loadData();
    } catch (err) {
      setError('Error creando evento: ' + (err instanceof Error ? err.message : 'Error desconocido'));
      console.error('Error creating event:', err);
    }
  };

  const handleDeleteArtist = async (artistId: string) => {
    try {
      setError(null);
      await ArtistService.delete(artistId);
      loadData();
    } catch (err) {
      setError('Error eliminando artista: ' + (err instanceof Error ? err.message : 'Error desconocido'));
      console.error('Error deleting artist:', err);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      setError(null);
      await EventService.delete(eventId);
      loadData();
    } catch (err) {
      setError('Error eliminando evento: ' + (err instanceof Error ? err.message : 'Error desconocido'));
      console.error('Error deleting event:', err);
    }
  };

  // Mostrar estado de carga
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Cargando...</h2>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar error de permisos o cualquier otro error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-red-600">Error</h2>
            <p className="mt-4 text-lg text-gray-900">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar mensaje si no hay usuario o no es admin
  if (!userProfile || userProfile.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Acceso Denegado</h2>
            <p className="mt-4 text-lg text-gray-600">
              Necesitas ser administrador para acceder a esta página.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">Panel de Administración</h2>
          <p className="mt-4 text-lg text-gray-600">
            Gestiona artistas y eventos
          </p>
        </div>

        {error && (
          <div className="mb-8 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Sección de Artistas */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Gestión de Artistas</h3>
            <form onSubmit={handleCreateArtist} className="space-y-4">
              <input
                type="text"
                placeholder="Nombre del Artista"
                value={artistForm.name}
                onChange={(e) => setArtistForm({...artistForm, name: e.target.value})}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                required
              />
              <input
                type="text"
                placeholder="Géneros (separados por coma)"
                value={artistForm.genres}
                onChange={(e) => setArtistForm({...artistForm, genres: e.target.value})}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                required
              />
              <textarea
                placeholder="Biografía"
                value={artistForm.bio}
                onChange={(e) => setArtistForm({...artistForm, bio: e.target.value})}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                required
              />
              <div className="space-y-2">
                <input
                  type="url"
                  placeholder="Spotify URL"
                  value={artistForm.socialLinks.spotify}
                  onChange={(e) => setArtistForm({
                    ...artistForm,
                    socialLinks: {...artistForm.socialLinks, spotify: e.target.value}
                  })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                />
                <input
                  type="url"
                  placeholder="Instagram URL"
                  value={artistForm.socialLinks.instagram}
                  onChange={(e) => setArtistForm({
                    ...artistForm,
                    socialLinks: {...artistForm.socialLinks, instagram: e.target.value}
                  })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                />
                <input
                  type="url"
                  placeholder="Twitter URL"
                  value={artistForm.socialLinks.twitter}
                  onChange={(e) => setArtistForm({
                    ...artistForm,
                    socialLinks: {...artistForm.socialLinks, twitter: e.target.value}
                  })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Crear Artista
              </button>
            </form>

            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-4">Lista de Artistas</h3>
              {artists.length === 0 ? (
                <p className="text-gray-600">No hay artistas registrados</p>
              ) : (
                artists.map((artist) => (
                  <div key={artist.id} className="border-b py-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-bold">{artist.name}</h4>
                        <p className="text-sm text-gray-600">{artist.genres.join(', ')}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteArtist(artist.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sección de Eventos */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Gestión de Eventos</h3>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <input
                type="text"
                placeholder="Título del Evento"
                value={eventForm.title}
                onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                required
              />
              <textarea
                placeholder="Descripción"
                value={eventForm.description}
                onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                required
              />
              <input
                type="datetime-local"
                value={eventForm.date}
                onChange={(e) => setEventForm({...eventForm, date: e.target.value})}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                required
              />
              <select
                value={eventForm.artistId}
                onChange={(e) => setEventForm({...eventForm, artistId: e.target.value})}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                required
              >
                <option value="">Selecciona un artista</option>
                {artists.map((artist) => (
                  <option key={artist.id} value={artist.id}>
                    {artist.name}
                  </option>
                ))}
              </select>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Dirección"
                  value={eventForm.location.address}
                  onChange={(e) => setEventForm({
                    ...eventForm,
                    location: {...eventForm.location, address: e.target.value}
                  })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                  required
                />
                <input
                  type="text"
                  placeholder="Ciudad"
                  value={eventForm.location.city}
                  onChange={(e) => setEventForm({
                    ...eventForm,
                    location: {...eventForm.location, city: e.target.value}
                  })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                  required
                />
                <input
                  type="text"
                  placeholder="País"
                  value={eventForm.location.country}
                  onChange={(e) => setEventForm({
                    ...eventForm,
                    location: {...eventForm.location, country: e.target.value}
                  })}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Crear Evento
              </button>
            </form>

            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-4">Lista de Eventos</h3>
              {events.length === 0 ? (
                <p className="text-gray-600">No hay eventos registrados</p>
              ) : (
                events.map((event) => (
                  <div key={event.id} className="border-b py-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-bold">{event.title}</h4>
                        <p className="text-sm text-gray-600">
                          {new Date(event.date.seconds * 1000).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          {event.location.city}, {event.location.country}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
