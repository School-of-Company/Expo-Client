import React from 'react';
import { ExpoManageForm } from '@/widgets/expo-manage';
import { Header } from '@/widgets/layout';

const ExpoManage = ({ params }: { params: { expo_id: string } }) => {
  return (
    <div className="flex h-screen flex-col gap-[30px] mobile:gap-5">
      <Header />
      <ExpoManageForm params={params} />
    </div>
  );
};

export default ExpoManage;
