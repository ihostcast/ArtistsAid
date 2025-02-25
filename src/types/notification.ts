export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: Date;
  userId: string;
  link?: string;
  metadata?: {
    eventId?: string;
    blogId?: string;
    bookingId?: string;
  };
}
