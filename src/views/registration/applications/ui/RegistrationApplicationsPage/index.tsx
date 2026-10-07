import { Suspense } from 'react';
import { ApplicationLedger } from '@/features/registration/applications';
import { Header } from '@/widgets/layout';

const RegistrationApplicationsPage = () => {
  return (
    <div className="flex min-h-screen flex-col gap-[30px]">
      <Header />
      <div className="flex flex-1 justify-center p-16">
        <Suspense>
          <ApplicationLedger />
        </Suspense>
      </div>
    </div>
  );
};

export default RegistrationApplicationsPage;
