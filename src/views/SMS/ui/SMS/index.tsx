import React from 'react';
import { Header } from '@/widgets/layout';
import { SMSContainer } from '@/widgets/SMS';

const SMS = () => {
  return (
    <div className="flex min-h-screen flex-col gap-[30px]">
      <Header />
      <div className="flex flex-1 justify-center p-16">
        <SMSContainer />
      </div>
    </div>
  );
};

export default SMS;
