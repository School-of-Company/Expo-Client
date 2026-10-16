import { Suspense } from 'react';
import { RegistrationLedger } from '@/features/registration/applications';
import { Header } from '@/widgets/layout';
import { RegistrationTabs } from '@/widgets/registration';

const RegistrationApplicationsPage = () => {
  return (
    <div className="flex min-h-screen flex-col gap-[30px]">
      <Header />
      <RegistrationTabs />
      <div className="flex flex-1 justify-center p-16">
        <Suspense>
          <RegistrationLedger />
        </Suspense>
      </div>
    </div>
  );
};

export default RegistrationApplicationsPage;
