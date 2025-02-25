import { Timestamp } from 'firebase/firestore';

export interface Author {
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

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  count?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  count?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export interface Comment {
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

export interface BlogStatus {
  'draft' | 'published' | 'private' | 'trash';
};

export interface BlogMeta {
  views: number;
  likes: number;
  shares: number;
  readingTime: number;
  featured: boolean;
  pinned: boolean;
};

export interface BlogSEO {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  ogDescription?: string;
  twitterCard?: string;
};

export interface BlogAuthor {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
};

export interface Blog {
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
  slug: string;
  excerpt: string;
  featuredImage: {
    url: string;
    alt: string;
    caption?: string;
  };
  categories: Category[];
  tags: Tag[];
  author: BlogAuthor;
  meta: BlogMeta;
  seo: BlogSEO;
  publishedAt?: Timestamp;
  scheduledFor?: Timestamp;
};

export interface BlogRevision {
  id: string;
  blogId: string;
  content: string;
  title: string;
  excerpt: string;
  author: BlogAuthor;
  createdAt: Timestamp;
  restoredAt?: Timestamp;
};
