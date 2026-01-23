import dynamic from 'next/dynamic';
import LoadingSpinner from '@/components/LoadingSpinner';

const ResetPasswordView = dynamic(() => import('@/views/ResetPasswordView'), {
  loading: () => <LoadingSpinner fullPage message="Loading..." />,
  ssr: false,
});

export default function ResetPasswordPage() {
  return <ResetPasswordView />;
}
