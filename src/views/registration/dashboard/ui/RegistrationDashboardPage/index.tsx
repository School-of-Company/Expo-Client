import { RegistrationDashboard } from '@/features/registration/dashboard';
import { Header } from '@/widgets/layout';

const RegistrationDashboardPage = () => {
  return (
    <div className="flex min-h-screen flex-col gap-[30px]">
      <Header />
      <div className="flex flex-1 justify-center p-16">
        <RegistrationDashboard />
      </div>
    </div>
  );
};

export default RegistrationDashboardPage;
