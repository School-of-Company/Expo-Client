import React from 'react';
import { Header } from '@/widgets/layout';
import { ExpoListContainer } from '@/widgets/main';

const Main = () => {
  return (
    <div className="flex h-screen flex-col gap-[30px] mobile:gap-0">
      <Header />
      <div className="mx-auto w-full max-w-[1200px] flex-1 overflow-auto px-5">
        <ExpoListContainer />
      </div>
    </div>
  );
};

export default Main;
