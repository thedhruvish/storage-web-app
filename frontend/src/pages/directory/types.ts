type metaData = {
  size: number;
};
export interface FileItem {
  id: string;
  _id: string;
  name: string;
  fileType?: "document" | "image" | "video" | "audio" | "other";
  type: "folder" | "file";
  metaData?: metaData;
  createdAt: string;
  updatedAt?: string;
  isStarred?: boolean;
  extension?: string;
}

export interface FileGridProps {
  files: Array<FileItem>;
  documentType: "folder" | "file";

  viewMode: "grid" | "list";
  onFileDoubleClick: (file: FileItem) => void;
}
