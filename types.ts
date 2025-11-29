export enum ImageFormat {
  JPEG = 'image/jpeg',
  PNG = 'image/png',
  WEBP = 'image/webp',
}

export interface ImageSettings {
  width: number;
  height: number;
  maintainAspectRatio: boolean;
  quality: number;
  format: ImageFormat;
}

export interface ImageDetails {
  name: string;
  size: number;
  width: number;
  height: number;
  src: string;
  type: string;
}

export interface AISuggestion {
  width?: number;
  height?: number;
  quality?: number;
  format?: ImageFormat;
  explanation?: string;
}
