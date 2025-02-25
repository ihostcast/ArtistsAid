'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Artist, Event } from '@/types/firestore';
import { ArtistService, EventService } from '@/utils/firestore';
import { Timestamp, serverTimestamp } from 'firebase/firestore';

export default function AdminPanel() {
  const { userProfile } = useAuth();
  const router = useRouter();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('artists');

  const [artistForm, setArtistForm] = useState({
    name: '',
    bio: '',
    genre: '',
    location: {
      city: '',
      country: ''
    },
    socialLinks: {
      instagram: '',
      twitter: '',
      website: ''
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
    artistId: '',
    status: 'active' as const
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [artistsData, eventsData] = await Promise.all([
        ArtistService.getAll(),
        EventService.getAll()
      ]);
      setArtists(artistsData);
      setEvents(eventsData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Error al cargar los datos');
    }
  };

  const handleCreateArtist = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      const newArtist: Omit<Artist, 'id'> = {
        name: artistForm.name,
        bio: artistForm.bio,
        genre: artistForm.genre,
        location: artistForm.location,
        socialLinks: artistForm.socialLinks,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: userProfile?.id || ''
      };

      await ArtistService.create(newArtist);
      setArtistForm({
        name: '',
        bio: '',
        genre: '',
        location: {
          city: '',
          country: ''
        },
        socialLinks: {
          instagram: '',
          twitter: '',
          website: ''
        }
      });
      loadData();
    } catch (err) {
      console.error('Error creating artist:', err);
      setError('Error al crear el artista');
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      const newEvent: Omit<Event, 'id'> = {
        title: eventForm.title,
        description: eventForm.description,
        date: Timestamp.fromDate(new Date(eventForm.date)),
        location: {
          address: eventForm.location.address,
          city: eventForm.location.city,
          country: eventForm.location.country,
        },
        artistId: eventForm.artistId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: userProfile?.id || '',
        status: eventForm.status
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
        artistId: '',
        status: 'active'
      });
      loadData();
    } catch (err) {
      console.error('Error creating event:', err);
      setError('Error al crear el evento');
    }
  };

  const handleDeleteArtist = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este artista?')) {
      try {
        await ArtistService.delete(id);
        loadData();
      } catch (err) {
        console.error('Error deleting artist:', err);
        setError('Error al eliminar el artista');
      }
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este evento?')) {
      try {
        await EventService.delete(id);
        loadData();
      } catch (err) {
        console.error('Error deleting event:', err);
        setError('Error al eliminar el evento');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
        <div className="space-x-4">
          <button
            onClick={() => setActiveTab('artists')}
            className={`px-4 py-2 rounded ${
              activeTab === 'artists'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Artistas
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2 rounded ${
              activeTab === 'events'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Eventos
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      {activeTab === 'artists' ? (
        <div>
          <form onSubmit={handleCreateArtist} className="mb-8 space-y-4">
            <h2 className="text-xl font-semibold mb-4">Crear Nuevo Artista</h2>
            <input
              type="text"
              value={artistForm.name}
              onChange={(e) =>
                setArtistForm({ ...artistForm, name: e.target.value })
              }
              placeholder="Nombre del artista"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              required
            />
            <textarea
              value={artistForm.bio}
              onChange={(e) =>
                setArtistForm({ ...artistForm, bio: e.target.value })
              }
              placeholder="Biografía"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              required
            />
            <input
              type="text"
              value={artistForm.genre}
              onChange={(e) =>
                setArtistForm({ ...artistForm, genre: e.target.value })
              }
              placeholder="Género musical"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                value={artistForm.location.city}
                onChange={(e) =>
                  setArtistForm({
                    ...artistForm,
                    location: { ...artistForm.location, city: e.target.value }
                  })
                }
                placeholder="Ciudad"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                required
              />
              <input
                type="text"
                value={artistForm.location.country}
                onChange={(e) =>
                  setArtistForm({
                    ...artistForm,
                    location: { ...artistForm.location, country: e.target.value }
                  })
                }
                placeholder="País"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                required
              />
            </div>
            <div className="space-y-2">
              <input
                type="text"
                value={artistForm.socialLinks.instagram}
                onChange={(e) =>
                  setArtistForm({
                    ...artistForm,
                    socialLinks: {
                      ...artistForm.socialLinks,
                      instagram: e.target.value
                    }
                  })
                }
                placeholder="Instagram"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              />
              <input
                type="text"
                value={artistForm.socialLinks.twitter}
                onChange={(e) =>
                  setArtistForm({
                    ...artistForm,
                    socialLinks: {
                      ...artistForm.socialLinks,
                      twitter: e.target.value
                    }
                  })
                }
                placeholder="Twitter"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              />
              <input
                type="text"
                value={artistForm.socialLinks.website}
                onChange={(e) =>
                  setArtistForm({
                    ...artistForm,
                    socialLinks: {
                      ...artistForm.socialLinks,
                      website: e.target.value
                    }
                  })
                }
                placeholder="Sitio web"
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {artists.map((artist) => (
              <div
                key={artist.id}
                className="bg-white shadow-lg rounded-lg p-6 relative"
              >
                <h3 className="text-xl font-semibold mb-2">{artist.name}</h3>
                <p className="text-gray-600 mb-4">{artist.bio}</p>
                <div className="text-sm text-gray-500">
                  <p>Género: {artist.genre}</p>
                  <p>
                    Ubicación: {artist.location.city}, {artist.location.country}
                  </p>
                </div>
                <div className="mt-4 space-y-1">
                  {artist.socialLinks.instagram && (
                    <a
                      href={artist.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700 block"
                    >
                      Instagram
                    </a>
                  )}
                  {artist.socialLinks.twitter && (
                    <a
                      href={artist.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700 block"
                    >
                      Twitter
                    </a>
                  )}
                  {artist.socialLinks.website && (
                    <a
                      href={artist.socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700 block"
                    >
                      Sitio web
                    </a>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteArtist(artist.id)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <form onSubmit={handleCreateEvent} className="mb-8 space-y-4">
            <h2 className="text-xl font-semibold mb-4">Crear Nuevo Evento</h2>
            <input
              type="text"
              value={eventForm.title}
              onChange={(e) =>
                setEventForm({ ...eventForm, title: e.target.value })
              }
              placeholder="Título del evento"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              required
            />
            <textarea
              value={eventForm.description}
              onChange={(e) =>
                setEventForm({ ...eventForm, description: e.target.value })
              }
              placeholder="Descripción"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              required
            />
            <input
              type="datetime-local"
              value={eventForm.date}
              onChange={(e) =>
                setEventForm({ ...eventForm, date: e.target.value })
              }
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              required
            />
            <select
              value={eventForm.artistId}
              onChange={(e) =>
                setEventForm({ ...eventForm, artistId: e.target.value })
              }
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              required
            >
              <option value="">Seleccionar artista</option>
              {artists.map((artist) => (
                <option key={artist.id} value={artist.id}>
                  {artist.name}
                </option>
              ))}
            </select>
            <select
              value={eventForm.status}
              onChange={(e) => setEventForm({...eventForm, status: e.target.value as 'active' | 'inactive'})}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              required
            >
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
            <div className="space-y-2">
              <input
                type="text"
                value={eventForm.location.address}
                onChange={(e) =>
                  setEventForm({
                    ...eventForm,
                    location: { ...eventForm.location, address: e.target.value }
                  })
                }
                placeholder="Dirección"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                required
              />
              <input
                type="text"
                value={eventForm.location.city}
                onChange={(e) =>
                  setEventForm({
                    ...eventForm,
                    location: { ...eventForm.location, city: e.target.value }
                  })
                }
                placeholder="Ciudad"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                required
              />
              <input
                type="text"
                value={eventForm.location.country}
                onChange={(e) =>
                  setEventForm({
                    ...eventForm,
                    location: { ...eventForm.location, country: e.target.value }
                  })
                }
                placeholder="País"
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white shadow-lg rounded-lg p-6 relative"
              >
                <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                <p className="text-gray-600 mb-4">{event.description}</p>
                <div className="text-sm text-gray-500">
                  <p>
                    Fecha:{' '}
                    {event.date instanceof Timestamp
                      ? event.date.toDate().toLocaleDateString()
                      : 'Fecha no disponible'}
                  </p>
                  <p>
                    Ubicación: {event.location.city}, {event.location.country}
                  </p>
                  <p>Estado: {event.status}</p>
                  <p>
                    Artista:{' '}
                    {artists.find((a) => a.id === event.artistId)?.name ||
                      'Desconocido'}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteEvent(event.id)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
