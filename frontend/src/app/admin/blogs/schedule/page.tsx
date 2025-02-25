'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import AdminLayout from '@/components/admin/AdminLayout';
import { Blog } from '@/types/blog';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { FiCalendar, FiClock, FiEdit2 } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

moment.locale('es');
const localizer = momentLocalizer(moment);

interface ScheduledPost extends Blog {
  start: Date;
  end: Date;
  title: string;
}

export default function BlogSchedule() {
  const [events, setEvents] = useState<ScheduledPost[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<ScheduledPost | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');

  useEffect(() => {
    fetchScheduledPosts();
  }, []);

  const fetchScheduledPosts = async () => {
    try {
      const q = query(
        collection(db, 'blogs'),
        where('scheduledFor', '>=', new Date())
      );
      const querySnapshot = await getDocs(q);
      const posts = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          start: data.scheduledFor.toDate(),
          end: moment(data.scheduledFor.toDate()).add(1, 'hour').toDate(),
          title: data.title
        };
      }) as ScheduledPost[];
      setEvents(posts);
    } catch (err) {
      console.error('Error fetching scheduled posts:', err);
      setError('Error al cargar los posts programados');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectEvent = (event: ScheduledPost) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  const handleDateChange = async (date: Date | null) => {
    if (!date || !selectedEvent) return;

    try {
      await updateDoc(doc(db, 'blogs', selectedEvent.id), {
        scheduledFor: date,
        updatedAt: new Date()
      });

      setEvents(prev =>
        prev.map(event =>
          event.id === selectedEvent.id
            ? {
                ...event,
                start: date,
                end: moment(date).add(1, 'hour').toDate(),
                scheduledFor: date
              }
            : event
        )
      );

      setShowModal(false);
    } catch (err) {
      console.error('Error updating schedule:', err);
      setError('Error al actualizar la programación');
    }
  };

  const eventStyleGetter = (event: ScheduledPost) => {
    return {
      style: {
        backgroundColor: '#3B82F6',
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0',
        display: 'block'
      }
    };
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Calendario de Publicaciones</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setView('month')}
              className={`px-4 py-2 rounded-md ${
                view === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 text-gray-700'
              }`}
            >
              Mes
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-4 py-2 rounded-md ${
                view === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 text-gray-700'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setView('day')}
              className={`px-4 py-2 rounded-md ${
                view === 'day'
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 text-gray-700'
              }`}
            >
              Día
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 'calc(100vh - 300px)' }}
            views={['month', 'week', 'day']}
            view={view}
            onView={(newView: any) => setView(newView)}
            eventPropGetter={eventStyleGetter}
            onSelectEvent={handleSelectEvent}
            messages={{
              next: 'Siguiente',
              previous: 'Anterior',
              today: 'Hoy',
              month: 'Mes',
              week: 'Semana',
              day: 'Día',
              agenda: 'Agenda',
              date: 'Fecha',
              time: 'Hora',
              event: 'Evento',
              noEventsInRange: 'No hay publicaciones programadas en este período'
            }}
          />
        </div>

        {showModal && selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-lg w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Programar Publicación
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Título
                  </label>
                  <p className="mt-1 text-sm text-gray-900">{selectedEvent.title}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Fecha y Hora de Publicación
                  </label>
                  <DatePicker
                    selected={selectedEvent.start}
                    onChange={handleDateChange}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="MMMM d, yyyy h:mm aa"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      window.location.href = `/admin/blogs/edit/${selectedEvent.id}`;
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Editar Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
