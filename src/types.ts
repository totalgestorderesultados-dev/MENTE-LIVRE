export enum ContentType {
  VIDEO = 'video',
  PDF = 'pdf'
}

export interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  order?: number;
  isVisible?: boolean;
}

export interface Content {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  type: ContentType;
  url: string;
  createdAt: string;
  status?: 'free' | 'hidden';
}

export interface Favorite {
  id: string;
  userId: string;
  contentId: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  isAdmin: boolean;
}
