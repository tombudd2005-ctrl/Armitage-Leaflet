export interface LeafletPage {
  id: string;
  imageUrl: string;
  file: File;
}

export enum AppState {
  UPLOAD = 'UPLOAD',
  VIEWER = 'VIEWER',
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isLoading?: boolean;
}

export interface AnalysisResult {
  summary: string;
  keyPoints: string[];
}
