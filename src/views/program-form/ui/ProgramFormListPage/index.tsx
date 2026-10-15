'use client';

import { ProgramFormList } from '@/features/registration/schedule';
import { Header } from '@/widgets/layout';
import { RegistrationTabs } from '@/widgets/registration';

const ProgramFormListPage = () => {
  return (
    <div className="flex min-h-screen flex-col gap-[30px]">
      <Header />
      <RegistrationTabs />
      <div className="flex flex-1 justify-center p-16">
        <ProgramFormList />
      </div>
    </div>
  );
};

export default ProgramFormListPage;
