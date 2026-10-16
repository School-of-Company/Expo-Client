'use client';

import { useParams } from 'next/navigation';
import { RegistrationDashboard } from '@/features/registration/dashboard';
import { RecentActivityList } from '@/features/registration/history';
import { Header } from '@/widgets/layout';
import { RegistrationTabs } from '@/widgets/registration';

const RegistrationDashboardPage = () => {
  const { expoId } = useParams<{ expoId: string }>();

  return (
    <div className="flex min-h-screen flex-col gap-[30px]">
      <Header />
      <RegistrationTabs />
      <div className="flex flex-1 justify-center p-16">
        <RegistrationDashboard
          recentActivity={<RecentActivityList expoId={expoId} />}
        />
      </div>
    </div>
  );
};

export default RegistrationDashboardPage;
