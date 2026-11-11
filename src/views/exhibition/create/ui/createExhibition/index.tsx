'use client';

import { ExhibitionForm } from '@/features/exhibition/common';
import { useCreateExhibitionMutation } from '@/features/exhibition/create/model/useCreateExhibitionMutation';
import { Header } from '@/widgets/layout';
import CreateSteps from '../CreateSteps';

/** 박람회 생성 1단계. 저장하면 박람회를 만들고 2단계(폼 설정)로 넘어간다 */
const CreateExhibition = () => {
  const { mutate, isPending, isSuccess } = useCreateExhibitionMutation();

  return (
    <div className="flex min-h-screen flex-col gap-[30px]">
      <Header />
      <div className="flex flex-1 flex-col items-center gap-32 p-16">
        <CreateSteps current={1} />
        <ExhibitionForm
          mutation={{ mutate, isPending, isSuccess }}
          submitLabel="다음: 폼 설정"
        />
      </div>
    </div>
  );
};

export default CreateExhibition;
