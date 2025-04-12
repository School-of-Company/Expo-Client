import React from 'react';
import { ExpoManageForm } from '@/widgets/expo-manage';
import { Header } from '@/widgets/layout';

const ExpoManage = ({ id }: { id: string }) => {
  return (
    <div className="bg-red flex min-h-screen flex-col gap-80 mobile:gap-40">
      <Header />
      <ExpoManageForm id={id} />
    </div>
  );
};

export default ExpoManage;
