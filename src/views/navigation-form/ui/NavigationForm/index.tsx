import React from 'react';
import { Header } from '@/widgets/layout';
import { NavigationFormContainer } from '@/widgets/navigation-form';

const Page = () => {
  return (
    <div className="flex h-screen flex-col mobile:gap-0">
      <Header />
      <div className="mx-auto w-full max-w-[800px] flex-1 overflow-auto px-5">
        <NavigationFormContainer />
      </div>
    </div>
  );
};

export default Page;
