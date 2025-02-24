import { Timestamp } from 'firebase/firestore';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'user';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  photoURL?: string;
}

export interface Artist {
  id: string;
  name: string;
  genres: string[];
  bio: string;
  socialLinks: {
    spotify?: string;
    instagram?: string;
    twitter?: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: Timestamp;
  location: {
    address: string;
    city: string;
    country: string;
  };
  artistId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

export interface Booking {
  id: string;
  eventId: string;
  userId: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
