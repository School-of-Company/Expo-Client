'use client';

import { useSearchParams } from 'next/navigation';
import { FormEditor } from '@/features/form/common';
import {
  transformServerData,
  useEditFormMutation,
  useGetEditForm,
} from '@/features/form/edit';
import { withLoading } from '@/shared/hocs';
import { ApplicationType } from '@/shared/types/exhibition/type';
import { Header } from '@/widgets/layout';

const EditForm = ({ id }: { id: string }) => {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') as 'STANDARD' | 'TRAINEE';
  const mode = searchParams.get('mode') as 'application' | 'survey';
  const application = searchParams
    .get('application')
    ?.toUpperCase() as ApplicationType;
  const { data, isLoading } = useGetEditForm(id, type, mode);
  const {
    handleSubmitForm,
    isApplicationPending,
    isSurveyPending,
    isApplicationSuccess,
    isSurveySuccess,
  } = useEditFormMutation(id, type, mode, application);

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
