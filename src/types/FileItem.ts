export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  path: string;
  createdAt: Date;
  modifiedAt: Date;
  parentId?: string;
  previewUrl?: string;
  isFavorite?: boolean;
  isDeleted?: boolean;
}

export interface UploadProgress {
  fileId: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
}
