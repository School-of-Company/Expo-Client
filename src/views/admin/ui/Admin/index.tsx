import React from 'react';
import { AdminPageWrapper } from '@/widgets/admin';
import { Header } from '@/widgets/layout';

const CreateExhibition = () => {
  return (
    <div className="flex min-h-screen flex-col mobile:gap-0">
      <Header />
      <div className="mx-auto w-full max-w-[1200px] flex-1 px-5 py-[30px]">
        <AdminPageWrapper />
      </div>
    </div>
  );
};

export default CreateExhibition;
