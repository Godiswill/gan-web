export * from './http';
export * from './fal';

export enum ImageType {
  PNG = 'image/png',
  // JPEG = 'image/jpeg',
  WEBP = 'image/webp',
}

export type Filexx = {
  beforeFile: Blob & { name: string };
  afterFile?: Blob & { name: string };
  status?: 'fulfilled' | 'rejected' | 'processing';
}[];

export type ImageFilesInfo = Array<{
  file: File;
  width: number;
  height: number;
}>;
