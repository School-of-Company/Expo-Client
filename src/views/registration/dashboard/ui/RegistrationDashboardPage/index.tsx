import { RegistrationDashboard } from '@/features/registration/dashboard';
import { Header } from '@/widgets/layout';
import { RegistrationTabs } from '@/widgets/registration';

const RegistrationDashboardPage = () => {
  return (
    <div className="flex min-h-screen flex-col gap-[30px]">
      <Header />
      <RegistrationTabs />
      <div className="flex justify-center p-16">
        <RegistrationDashboard />
      </div>
    </div>
  );
};

export default RegistrationDashboardPage;
