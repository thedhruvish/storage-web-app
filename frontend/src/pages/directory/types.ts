export interface FileItem {
  id: string;
  _id: string;
  name: string;
  fileType?: "document" | "image" | "video" | "audio" | "other";
  type: "folder" | "file";
  size?: string;
  createdAt: Date;
  isStarred?: boolean;
  extension?: string;
}

export interface FileGridProps {
  files: Array<FileItem>;
  documentType: "folder" | "file";

  viewMode: "grid" | "list";
  onFileClick?: (file: FileItem) => void;
}
