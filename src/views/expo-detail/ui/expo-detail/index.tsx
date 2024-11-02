import React from 'react';
import ExpoDetailLayout from '@/widgets/expo-detail/ui/ExpoDetailLayout';
import { Header } from '@/widgets/layout';

const ExpoDetail = () => {
  return (
    <div className="flex h-screen flex-col mobile:gap-0">
      <Header />
      <div className="mx-auto w-full max-w-[842px] flex-1 px-5 py-[30px]">
        <ExpoDetailLayout />
      </div>
    </div>
  );
};

export default ExpoDetail;
