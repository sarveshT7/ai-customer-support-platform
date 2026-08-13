export interface Document {
  id: string;
  title: string | null;
  source: string;
  sourceType: string | null;
  mimeType: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  chunkIndex: number;
  content: string;
  section: string | null;
  pageNumber: number | null;
  tokenCount: number | null;
  embedding: number[] | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
}
