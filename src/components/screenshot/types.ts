export interface ScreenshotAttachment {
  id: string;
  name: string;
  dataUrl: string;
  capturedAt: Date;
  width: number;
  height: number;
  isScreenshot: true;
}

export interface FileAttachment {
  id: string;
  name: string;
  file: File;
  previewUrl?: string;
  isScreenshot: false;
}

export type Attachment = ScreenshotAttachment | FileAttachment;

export type AttachPopupContext = "message" | "request" | "comment";
