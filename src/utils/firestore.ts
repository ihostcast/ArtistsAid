import { db } from '@/config/firebase';
import { 
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  DocumentReference,
  CollectionReference
} from 'firebase/firestore';
import { Artist, Booking, Event, User } from '@/types/firestore';

// Collections references
export const usersRef = collection(db, 'users');
export const artistsRef = collection(db, 'artists');
export const eventsRef = collection(db, 'events');
export const bookingsRef = collection(db, 'bookings');

// Generic CRUD operations
export async function getDocument<T>(
  ref: DocumentReference
): Promise<T | null> {
  try {
    const snapshot = await getDoc(ref);
    return snapshot.exists() ? snapshot.data() as T : null;
  } catch (error) {
    console.error('Error getting document:', error);
    throw error;
  }
}

export async function getCollection<T>(
  ref: CollectionReference,
  conditions?: { field: string; operator: string; value: any }[]
) {
  try {
    let q = ref;
    
    if (conditions) {
      q = query(
        ref,
        ...conditions.map(c => where(c.field, c.operator as any, c.value))
      );
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as T[];
  } catch (error) {
    console.error('Error getting collection:', error);
    throw error;
  }
}

export async function createDocument<T>(
  ref: CollectionReference,
  data: Omit<T, 'id'>
) {
  try {
    const timestamp = Timestamp.now();
    const docRef = await addDoc(ref, {
      ...data,
      createdAt: timestamp,
      updatedAt: timestamp
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating document:', error);
    throw error;
  }
}

export async function updateDocument<T>(
  ref: DocumentReference,
  data: Partial<T>
) {
  try {
    const timestamp = Timestamp.now();
    await updateDoc(ref, {
      ...data,
      updatedAt: timestamp
    });
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
}

export async function deleteDocument(ref: DocumentReference) {
  try {
    await deleteDoc(ref);
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
}

// Specific collection operations
export const UserService = {
  get: async (userId: string) => {
    return getDocument<User>(doc(usersRef, userId));
  },
  update: async (userId: string, data: Partial<User>) => {
    return updateDocument<User>(doc(usersRef, userId), data);
  }
};

export const ArtistService = {
  getAll: async () => {
    return getCollection<Artist>(artistsRef);
  },
  get: async (artistId: string) => {
    return getDocument<Artist>(doc(artistsRef, artistId));
  },
  create: async (data: Omit<Artist, 'id'>) => {
    return createDocument<Artist>(artistsRef, data);
  },
  update: async (artistId: string, data: Partial<Artist>) => {
    return updateDocument<Artist>(doc(artistsRef, artistId), data);
  },
  delete: async (artistId: string) => {
    return deleteDocument(doc(artistsRef, artistId));
  }
};

export const EventService = {
  getAll: async () => {
    return getCollection<Event>(eventsRef, [
      { field: 'date', operator: '>=', value: Timestamp.now() }
    ]);
  },
  get: async (eventId: string) => {
    return getDocument<Event>(doc(eventsRef, eventId));
  },
  create: async (data: Omit<Event, 'id'>) => {
    return createDocument<Event>(eventsRef, data);
  },
  update: async (eventId: string, data: Partial<Event>) => {
    return updateDocument<Event>(doc(eventsRef, eventId), data);
  },
  delete: async (eventId: string) => {
    return deleteDocument(doc(eventsRef, eventId));
  }
};

export const BookingService = {
  getByUser: async (userId: string) => {
    return getCollection<Booking>(bookingsRef, [
      { field: 'userId', operator: '==', value: userId }
    ]);
  },
  create: async (data: Omit<Booking, 'id'>) => {
    return createDocument<Booking>(bookingsRef, data);
  },
  update: async (bookingId: string, data: Partial<Booking>) => {
    return updateDocument<Booking>(doc(bookingsRef, bookingId), data);
  },
  delete: async (bookingId: string) => {
    return deleteDocument(doc(bookingsRef, bookingId));
  }
};
