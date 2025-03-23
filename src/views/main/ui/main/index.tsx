import React from 'react';
import { Header } from '@/widgets/layout';
import { ExpoListContainer } from '@/widgets/main';

const Main = () => {
  return (
    <div className="flex min-h-screen flex-col gap-[5.625rem] pb-16 mobile:gap-[2.8125rem]">
      <Header />
      <div className="mx-auto w-full max-w-[75rem] flex-1 overflow-auto px-5">
        <ExpoListContainer />
      </div>
    </div>
  );
};

export default Main;
