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
  accessLevel?: 'public' | 'private';
}

export interface ContentLink {
  title: string;
  url: string;
}

export interface Content {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  type: ContentType;
  url: string;
  links?: ContentLink[];
  createdAt: string;
  status?: 'free' | 'hidden';
  accessLevel?: 'public' | 'private';
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

export interface AccessCode {
  id: string; // The 9 digit code itself or doc ID
  code: string;
  label?: string;
  createdAt: string;
  isActive: boolean;
}
