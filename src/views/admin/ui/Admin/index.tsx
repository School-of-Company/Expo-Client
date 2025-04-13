import React from 'react';
import { AdminPageWrapper } from '@/widgets/admin';
import { Header } from '@/widgets/layout';

const CreateExhibition = () => {
  return (
    <div className="flex min-h-screen flex-col gap-[30px]">
      <Header />
      <div className="flex flex-1 justify-center p-16">
        <AdminPageWrapper />
      </div>
    </div>
  );
};

export default CreateExhibition;
