import dynamic from 'next/dynamic';
import LoadingSpinner from '@/components/LoadingSpinner';

const DashboardView = dynamic(() => import('@/views/DashboardView'), {
  loading: () => <LoadingSpinner fullPage message="Loading Dashboard..." />,
  ssr: false,
});

export default function DashboardPage() {
  return <DashboardView />;
}
