export interface FileItem {
  _id: string;
  name: string;
  fileType?: "document" | "image" | "video" | "audio" | "other";
  size?: string;
  createdAt: Date;
  starred?: boolean;
  extension?: string;
}

export interface FileGridProps {
  files: Array<FileItem>;
  documentType: "folder" | "file";

  viewMode: "grid" | "list";
  onFileClick?: (file: FileItem) => void;
}
