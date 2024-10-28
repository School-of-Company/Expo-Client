import React from 'react';
import { Header } from '@/widgets/layout';
import { SMSContainer } from '@/widgets/SMS';

const SMS = () => {
  return (
    <div className="flex h-screen flex-col gap-[30px] mobile:gap-5">
      <Header />
      <div>
        <SMSContainer />
      </div>
    </div>
  );
};

export default SMS;
