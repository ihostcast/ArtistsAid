export type Artist = {
  name: string;
  image: string;
  bio: string;
};

export type Stats = {
  views: number;
  likes: number;
  shares: number;
};

export type Demo = {
  id: number;
  slug: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  category: string;
  artist: Artist;
  stats: Stats;
  publishDate: string;
  tags: string[];
  fullDescription?: string;
};
