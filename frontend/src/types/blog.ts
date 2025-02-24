export type Author = {
  id: string;
  name: string;
  image: string;
  bio: string;
  role: string;
  socialLinks?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    website?: string;
  };
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
};

export type Tag = {
  id: string;
  name: string;
  slug: string;
  description?: string;
};

export type Comment = {
  id: string;
  content: string;
  authorName: string;
  authorEmail: string;
  authorId?: string;
  createdAt: Date;
  updatedAt?: Date;
  status: 'pending' | 'approved' | 'spam' | 'trash';
  parentId?: string;
};

export type BlogStatus = 'draft' | 'published' | 'private' | 'trash';

export type Blog = {
  id?: string;
  title: string;
  content: string;
  imageUrl?: string;
  status: BlogStatus;
  author: {
    uid: string;
    name: string;
    email: string | null;
  };
  createdAt: Date;
  updatedAt: Date;
  test?: boolean;
};
