export type VideoCategory = 'audition' | 'dance';

export type GrooveXVideo = {
  id: string;
  title: string;
  description: string;
  category: VideoCategory;
  featured: boolean;
  streamUrl: string;
  thumbnailUrl: string | null;
  createdAt: string;
};
