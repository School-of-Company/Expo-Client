import React from 'react';
import { AdminPageWrapper } from '@/widgets/admin';
import { Header } from '@/widgets/layout';

const CreateExhibition = () => {
  return (
    <div className="flex h-screen flex-col gap-[30px] mobile:gap-0">
      <Header />
      <div className="mx-auto w-full max-w-[1200px] flex-1 px-5">
        <AdminPageWrapper />
      </div>
    </div>
  );
};

export default CreateExhibition;
