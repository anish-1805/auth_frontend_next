import api from '@/config/axios';

export interface FileStats {
  file_name: string;
  file_size_bytes: number;
  file_size_kb: number;
  file_size_mb: number;
  total_lines: number | null;
  total_chunks: number | null;
  total_characters: number | null;
  total_words: number | null;
  file_type: string;
  chunk_size_used: number;
}

export interface FileUploadResponse {
  success: boolean;
  message: string;
  file_stats: FileStats;
}

export interface FileListResponse {
  success: boolean;
  files: FileStats[];
  total_files: number;
}

class FileService {
  /**
   * Upload a PDF file
   */
  static async uploadFile(file: File): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/api/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  /**
   * Get list of uploaded files
   */
  static async listFiles(): Promise<FileListResponse> {
    const response = await api.get('/api/files/list');
    return response.data;
  }

  /**
   * Analyze a specific file
   */
  static async analyzeFile(fileName: string): Promise<FileStats> {
    const response = await api.get(`/api/files/analyze/${fileName}`);
    return response.data;
  }

  /**
   * Delete a file
   */
  static async deleteFile(fileName: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/api/files/delete/${fileName}`);
    return response.data;
  }
}

export default FileService;
