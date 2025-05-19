'use client';

import { ExhibitionForm } from '@/features/exhibition/common';
import { useCreateExhibitionMutation } from '@/features/exhibition/create/model/useCreateExhibitionMutation';
import { Header } from '@/widgets/layout';

const CreateExhibition = () => {
  const { mutate, isPending, isSuccess } = useCreateExhibitionMutation();

  return (
    <div className="flex min-h-screen flex-col gap-[30px]">
      <Header />
      <div className="flex flex-1 justify-center p-16">
        <ExhibitionForm mutation={{ mutate, isPending, isSuccess }} />
      </div>
    </div>
  );
};

export default CreateExhibition;
