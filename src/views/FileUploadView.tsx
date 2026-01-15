import React, { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import FileService, { FileStats } from '@/services/fileService';
import styles from '@/components/FileUpload/FileUpload.module.css';

export default function FileUploadView() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileStats, setUploadedFileStats] = useState<FileStats | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<FileStats[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load uploaded files on mount
  useEffect(() => {
    loadUploadedFiles();
  }, []);

  const loadUploadedFiles = async () => {
    try {
      setIsLoadingFiles(true);
      const response = await FileService.listFiles();
      setUploadedFiles(response.files);
    } catch (error) {
      console.error('Failed to load files:', error);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
        setUploadedFileStats(null);
      } else {
        toast.error('Please select a PDF file');
      }
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
        setUploadedFileStats(null);
      } else {
        toast.error('Please select a PDF file');
      }
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadedFileStats(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      const response = await FileService.uploadFile(selectedFile);

      setUploadedFileStats(response.file_stats);
      toast.success(response.message);

      // Reload files list
      await loadUploadedFiles();

      // Clear selected file
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || 'Failed to upload file');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (fileName: string) => {
    if (!confirm(`Are you sure you want to delete ${fileName}?`)) return;

    try {
      await FileService.deleteFile(fileName);
      toast.success('File deleted successfully');
      await loadUploadedFiles();

      // Clear stats if deleted file was the last uploaded one
      if (uploadedFileStats?.file_name === fileName) {
        setUploadedFileStats(null);
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || 'Failed to delete file');
      console.error('Delete error:', error);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className={styles.uploadContainer}>
      {/* Upload Card */}
      <div className={styles.uploadCard}>
        <div className={styles.uploadHeader}>
          <h1>📄 PDF File Upload</h1>
          <p>Upload PDF files and analyze them using memory-efficient generators</p>
        </div>

        {/* Dropzone */}
        <div
          className={`${styles.dropzone} ${isDragging ? styles.dragActive : ''} ${
            isUploading ? styles.disabled : ''
          }`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
        >
          <div className={styles.uploadIcon}>📤</div>
          <div className={styles.dropzoneText}>
            <h3>Drag & Drop your PDF file here</h3>
            <p>or</p>
            <button className={styles.browseButton} disabled={isUploading}>
              Browse Files
            </button>
            <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#999' }}>
              Supported format: PDF (Max 10MB)
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileSelect}
            className={styles.fileInput}
            disabled={isUploading}
          />
        </div>

        {/* Selected File */}
        {selectedFile && (
          <div className={styles.selectedFile}>
            <div className={styles.fileInfo}>
              <div className={styles.fileIcon}>📄</div>
              <div className={styles.fileDetails}>
                <h4>{selectedFile.name}</h4>
                <p>{formatBytes(selectedFile.size)}</p>
              </div>
            </div>
            <button
              className={styles.removeButton}
              onClick={handleRemoveFile}
              disabled={isUploading}
            >
              Remove
            </button>
          </div>
        )}

        {/* Upload Button */}
        {selectedFile && (
          <button className={styles.uploadButton} onClick={handleUpload} disabled={isUploading}>
            {isUploading ? (
              <>
                <div className={styles.spinner}></div>
                Uploading & Analyzing...
              </>
            ) : (
              <>
                <span>🚀</span>
                Upload & Analyze File
              </>
            )}
          </button>
        )}
      </div>

      {/* File Statistics */}
      {uploadedFileStats && (
        <div className={styles.statsCard}>
          <div className={styles.statsHeader}>
            <h2>
              <span className={styles.statsIcon}>📊</span>
              File Analysis Results
            </h2>
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>File Name</div>
              <div
                className={styles.statValue}
                style={{ fontSize: '1.25rem' }}
                title={uploadedFileStats.file_name}
              >
                {uploadedFileStats.file_name}
              </div>
            </div>

            {uploadedFileStats.total_words !== null && (
              <div className={styles.statItem}>
                <div className={styles.statLabel}>Word Count</div>
                <div className={styles.statValue}>
                  {uploadedFileStats.total_words.toLocaleString()}
                  <span className={styles.statUnit}>words</span>
                </div>
              </div>
            )}

            {uploadedFileStats.total_chunks !== null && (
              <div className={styles.statItem}>
                <div className={styles.statLabel}>Number of Chunks</div>
                <div className={styles.statValue}>
                  {uploadedFileStats.total_chunks.toLocaleString()}
                  <span className={styles.statUnit}>chunks</span>
                </div>
              </div>
            )}
          </div>

          <div className={styles.successMessage}>
            <span>✅</span>
            <span>
              File processed using memory-efficient generators! Only{' '}
              {(uploadedFileStats.chunk_size_used / 1024).toFixed(2)} KB in memory at a time.
            </span>
          </div>
        </div>
      )}

      {/* Uploaded Files List */}
      <div className={styles.filesList}>
        <div className={styles.filesHeader}>
          <h2>📁 Your Uploaded Files ({uploadedFiles.length})</h2>
          <button className={styles.refreshButton} onClick={loadUploadedFiles}>
            🔄 Refresh
          </button>
        </div>

        {isLoadingFiles ? (
          <div className={styles.emptyState}>
            <div className={styles.spinner} style={{ margin: '0 auto' }}></div>
            <p>Loading files...</p>
          </div>
        ) : uploadedFiles.length === 0 ? (
          <div className={styles.emptyState}>
            <div style={{ fontSize: '3rem' }}>📭</div>
            <p>No files uploaded yet. Upload your first PDF file above!</p>
          </div>
        ) : (
          <table className={styles.filesTable}>
            <thead>
              <tr>
                <th>File Name</th>
                <th>Size</th>
                <th>Chunks</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {uploadedFiles.map((file) => (
                <tr key={file.file_name}>
                  <td>{file.file_name}</td>
                  <td>{file.file_size_mb.toFixed(2)} MB</td>
                  <td>{file.total_chunks?.toLocaleString() || 'N/A'}</td>
                  <td>{file.file_type}</td>
                  <td>
                    <button
                      className={styles.deleteFileButton}
                      onClick={() => handleDeleteFile(file.file_name)}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
