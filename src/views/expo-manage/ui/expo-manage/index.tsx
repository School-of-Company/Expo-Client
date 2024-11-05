import React from 'react';
import { FilterTab, TableForm } from '@/widgets/expo-manage';
import { Header } from '@/widgets/layout';

const ExpoManage = () => {
  return (
    <div className="flex h-screen flex-col gap-[30px] mobile:gap-5">
      <Header />
      <div className="mx-auto w-full max-w-[1200px] space-y-[30px] px-5">
        <FilterTab />
        <TableForm />
      </div>
    </div>
  );
};

export default ExpoManage;
