'use client';

import React from 'react';
import { useCreateExhibitionMutation } from '@/widgets/exhibition/create/model/useCreateExhibitionMutation';
import ExhibitionForm from '@/widgets/exhibition/ui/ExhibitionForm';
import { Header } from '@/widgets/layout';

const CreateExhibition = () => {
  const mutation = useCreateExhibitionMutation();
  return (
    <div className="flex min-h-screen flex-col gap-[30px]">
      <Header />
      <div className="flex flex-1 justify-center p-16">
        <ExhibitionForm mutation={mutation} />
      </div>
    </div>
  );
};

export default CreateExhibition;
