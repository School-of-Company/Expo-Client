'use client';

import { useSearchParams } from 'next/navigation';
import React from 'react';
import withLoading from '@/shared/hocs/withLoading';
import FormEditor from '@/views/form/ui/FormEditor';
import { Header } from '@/widgets/layout';
import { transformServerData } from '../../model/transformServerData';
import { useEditFormMutation } from '../../model/useEditFormMutation';
import { useGetEditForm } from '../../model/useGetEditForm';

const EditForm = ({ id }: { id: string }) => {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') as 'STANDARD' | 'TRAINEE';
  const mode = searchParams.get('mode') as 'application' | 'survey';
  const { data, isLoading } = useGetEditForm(id, type, mode);
  const {
    handleSubmitForm,
    isApplicationPending,
    isSurveyPending,
    isApplicationSuccess,
    isSurveySuccess,
  } = useEditFormMutation(id, type, mode);

  const defaultValues = data ? transformServerData(data, mode) : undefined;

  return (
    <div className="flex min-h-screen flex-col gap-[30px]">
      <Header />
      {withLoading({
        isLoading,
        children: (
          <div className="flex flex-1 justify-center overflow-hidden p-16">
            <FormEditor
              type={type}
              mode={mode}
              defaultValues={defaultValues}
              onSubmit={handleSubmitForm}
              isLoading={isApplicationPending || isSurveyPending}
              isSuccess={isApplicationSuccess || isSurveySuccess}
            />
          </div>
        ),
      })}
    </div>
  );
};

export default EditForm;
