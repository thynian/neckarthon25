export type Client = {
  id: string;
  name: string;
  createdAt: string;
};

export type CaseStatus = "OPEN" | "CLOSED";

export type Case = {
  id: string;
  caseId: string; // z. B. CASE-2025-001
  clientId: string; // Referenz auf Client.id
  title: string;
  status: CaseStatus;
  createdAt: string;
};

export type AudioFile = {
  id: string;
  fileName: string;
  createdAt: string;
  durationMs: number;
  blobUrl: string;
};

export type Attachment = {
  id: string;
  fileName: string;
  fileType: string;
  size: number;
  blobUrl: string;
};

export type DocumentationStatus = "OPEN" | "CLOSED";

export type Documentation = {
  id: string;
  caseId: string; // Referenz auf Case.id
  title: string;
  date: string; // ISO Datum/Zeit
  audioFiles: AudioFile[];
  attachments: Attachment[];
  todos: string; // Freitext, ein ToDo pro Zeile
  transcriptText?: string;
  summaryText?: string;
  status: DocumentationStatus;
  createdAt: string;
};
