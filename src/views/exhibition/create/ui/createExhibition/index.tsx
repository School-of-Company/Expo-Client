'use client';

import React from 'react';
import { useCreateExhibitionMutation } from '@/widgets/exhibition/create/model/useCreateExhibitionMutation';
import ExhibitionForm from '@/widgets/exhibition/ui/ExhibitionForm';
import { Header } from '@/widgets/layout';

const CreateExhibition = () => {
  const mutation = useCreateExhibitionMutation();
  return (
    <div className="flex min-h-screen flex-col gap-[30px] mobile:gap-0">
      <Header />
      <div className="mx-auto w-full max-w-[816px] flex-1 px-5 pb-5">
        <ExhibitionForm mutation={mutation} />
      </div>
    </div>
  );
};

export default CreateExhibition;
