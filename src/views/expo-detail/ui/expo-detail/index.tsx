import React from 'react';
import ExpoActionPanel from '@/widgets/expo-detail/ui/ExpoActionPanel';
import ExpoDetailLayout from '@/widgets/expo-detail/ui/ExpoDetailLayout';
import { Header } from '@/widgets/layout';

const ExpoDetail = ({ params }: { params: number }) => {
  return (
    <div className="flex h-screen flex-col mobile:gap-0">
      <Header />
      <div className="flex justify-center gap-[20px] px-5 py-[30px] mobile:flex-col">
        <div className="w-full max-w-[842px]">
          <ExpoDetailLayout params={params} />
        </div>
        <ExpoActionPanel />
      </div>
    </div>
  );
};

export default ExpoDetail;
