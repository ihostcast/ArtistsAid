import { Timestamp, FieldValue } from 'firebase/firestore';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'user';
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
  photoURL?: string;
}

export interface Artist {
  id: string;
  name: string;
  bio: string;
  genre: string;
  location: {
    city: string;
    country: string;
  };
  socialLinks: {
    instagram: string;
    twitter: string;
    website: string;
  };
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
  createdBy: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: Timestamp | FieldValue;
  location: {
    address: string;
    city: string;
    country: string;
  };
  artistId: string;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
  createdBy: string;
  status: 'active' | 'inactive';
}

export interface Booking {
  id: string;
  eventId: string;
  userId: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  author: {
    uid: string;
    name: string;
    email: string | null;
  };
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
  metadata: {
    tags: string[];
    category: string;
    views: number;
    likes: number;
    readingTime: number;
  };
  status: 'draft' | 'published';
}
