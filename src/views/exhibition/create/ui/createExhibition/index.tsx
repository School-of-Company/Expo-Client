import React from 'react';
import { CreateExhibitionForm } from '@/widgets/exhibition/create';
import { Header } from '@/widgets/layout';

const CreateExhibition = () => {
  return (
    <div className="flex h-screen flex-col gap-[30px] mobile:gap-0">
      <Header />
      <div className="mx-auto w-full max-w-[792px] flex-1 px-5 pb-5">
        <CreateExhibitionForm />
      </div>
    </div>
  );
};

export default CreateExhibition;
