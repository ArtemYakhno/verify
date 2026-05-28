export type UploadStatus = "pending" | "uploading" | "success" | "error";

export type UploadProgressState = {
  isVisible: boolean;
  fileName: string | null;
  fileSize: number;
  progress: number;
  status: "idle" | "uploading" | "success" | "error";
};
export type UploadImageProgressHandler = (progress: number) => void;
