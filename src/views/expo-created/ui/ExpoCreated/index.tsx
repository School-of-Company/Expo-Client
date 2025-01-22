import React from 'react';
import { ExpoCreatedContainer } from '@/widgets/expo-created';
import { Header } from '@/widgets/layout';

const Page = ({ id }: { id: string }) => {
  return (
    <div className="flex h-screen flex-col mobile:gap-0">
      <Header />
      <div className="mx-auto w-full max-w-[800px] flex-1 overflow-auto px-5">
        <ExpoCreatedContainer id={id} />
      </div>
    </div>
  );
};

export default Page;
