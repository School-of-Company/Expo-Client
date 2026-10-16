import { Suspense } from 'react';
import { PreregisterLedger } from '@/features/registration/applications';
import { Header } from '@/widgets/layout';
import { RegistrationTabs } from '@/widgets/registration';

const RegistrationPreregisterPage = () => {
  return (
    <div className="flex min-h-screen flex-col gap-[30px]">
      <Header />
      <RegistrationTabs />
      <div className="flex flex-1 justify-center p-16">
        <div className="flex w-full max-w-[1200px] flex-1 flex-col">
          <Suspense>
            <PreregisterLedger />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPreregisterPage;
