import React from 'react';
import { Header } from '@/widgets/layout';
import { ExpoListContainer } from '@/widgets/main';

const Main = () => {
  return (
    <div className="flex min-h-screen flex-col gap-[30px]">
      <Header />
      <div className="flex flex-1 justify-center p-16">
        <ExpoListContainer />
      </div>
    </div>
  );
};

export default Main;
