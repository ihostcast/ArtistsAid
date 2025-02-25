import { Timestamp } from 'firebase/firestore';

export interface EventOrganizer {
  uid: string;
  name: string;
  email: string | null;
}

export interface Event {
  id?: string;
  title: string;
  description: string;
  imageUrl?: string;
  date: Date | Timestamp;
  location: string;
  price: number;
  capacity: number;
  status: 'active' | 'inactive';
  organizer: EventOrganizer;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  tags?: string[];
}
