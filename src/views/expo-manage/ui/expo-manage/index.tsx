import React from 'react';
import { ExpoManageForm } from '@/widgets/expo-manage';
import { Header } from '@/widgets/layout';

const ExpoManage = ({ id }: { id: string }) => {
  return (
    <div className="flex min-h-screen flex-col gap-[30px]">
      <Header />
      <div className="flex flex-1 justify-center p-16">
        <ExpoManageForm id={id} />
      </div>
    </div>
  );
};

export default ExpoManage;
