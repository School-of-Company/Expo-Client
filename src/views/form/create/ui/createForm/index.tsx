'use client';

import { useSearchParams } from 'next/navigation';
import React from 'react';
import FormEditor from '@/features/form/common/ui/FormEditor';
import { useCreateFormMutation } from '@/features/form/create';
import { Header } from '@/widgets/layout';

const CreateForm = ({ id }: { id: string }) => {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') as 'STANDARD' | 'TRAINEE';
  const mode = searchParams.get('mode') as 'application' | 'survey';
  const {
    handleSubmitForm,
    isApplicationPending,
    isSurveyPending,
    isApplicationSuccess,
    isSurveySuccess,
  } = useCreateFormMutation(id, type, mode);
  return (
    <div className="flex min-h-screen flex-col gap-[30px]">
      <Header />
      <div className="flex flex-1 justify-center p-16">
        <FormEditor
          type={type}
          mode={mode}
          onSubmit={handleSubmitForm}
          isLoading={isApplicationPending || isSurveyPending}
          isSuccess={isApplicationSuccess || isSurveySuccess}
        />
      </div>
    </div>
  );
};

export default CreateForm;
