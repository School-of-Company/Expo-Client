import React from 'react';
import { ExhibitionForm } from '@/widgets/create-exhibition';
import { Header } from '@/widgets/layout';

const CreateExhibition = () => {
  return (
    <div className="flex h-screen flex-col gap-[30px] mobile:gap-0">
      <Header />
      <div className="mx-auto w-full max-w-[792px] flex-1 px-5">
        <ExhibitionForm />
      </div>
    </div>
  );
};

export default CreateExhibition;
