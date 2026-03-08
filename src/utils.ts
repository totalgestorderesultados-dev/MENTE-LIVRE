import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getYouTubeId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export function getGoogleDriveEmbedUrl(url: string) {
  if (url.includes('drive.google.com')) {
    // Convert view link to embed link
    // Example: https://drive.google.com/file/d/ID/view -> https://drive.google.com/file/d/ID/preview
    return url.replace(/\/view(\?.*)?$/, '/preview');
  }
  return url;
}
