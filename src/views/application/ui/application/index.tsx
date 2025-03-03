import React from 'react';
import ApplicationLayout from '@/widgets/application/ui/ApplicationLayout';
import { Header } from '@/widgets/layout';

const Application = ({ params }: { params: string }) => {
  return (
    <div className="flex h-screen flex-col mobile:gap-0">
      <Header />
      <div className="flex justify-center gap-[20px] px-5 py-[30px] mobile:flex-col">
        <div className="w-full max-w-[842px]">
          <ApplicationLayout params={params} />
        </div>
      </div>
    </div>
  );
};

export default Application;
