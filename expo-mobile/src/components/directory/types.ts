export interface FileItem {
  id: string;
  _id: string;
  name: string;
  fileType?: "document" | "image" | "video" | "audio" | "other";
  type: "folder" | "file";
  metaData?: {
    size: number;
  };
  createdAt: string;
  updatedAt?: string;
  isStarred?: boolean;
  extension?: string;
  previewUrl?: string;
  trashAt?: string | null;
  shareId?: string;
  isGuest?: boolean;
}

export interface FileGridProps {
  files: Array<FileItem>;
  documentType?: "folder" | "file";
  viewMode: "grid" | "list";
  onFileDoubleClick: (file: FileItem) => void;
  onMenuPress?: (file: FileItem) => void;
  showHeader?: boolean;
}
