'use client';

import dynamic from 'next/dynamic';
import LoadingSpinner from '@/components/LoadingSpinner';

const FileUploadView = dynamic(() => import('@/views/FileUploadView'), {
  loading: () => <LoadingSpinner fullPage message="Loading File Upload..." />,
  ssr: false,
});

export default function FileUploadPage() {
  return <FileUploadView />;
}
