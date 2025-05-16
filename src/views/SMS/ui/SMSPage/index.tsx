import React from 'react';
import { Header } from '@/widgets/layout';
import { SMSFormWrapper } from '@/widgets/SMS';

const SMSPage = () => {
  return (
    <div className="flex min-h-screen flex-col gap-[30px]">
      <Header />
      <div className="flex flex-1 justify-center p-16">
        <SMSFormWrapper />
      </div>
    </div>
  );
};

export default SMSPage;
