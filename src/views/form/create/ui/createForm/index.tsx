'use client';

import { useSearchParams } from 'next/navigation';

import FormEditor from '@/features/form/common/ui/FormEditor';
import { useCreateFormMutation } from '@/features/form/create';
import { ApplicationType } from '@/shared/types/exhibition/type';
import { Header } from '@/widgets/layout';

const CreateForm = ({ id }: { id: string }) => {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') as 'STANDARD' | 'TRAINEE';
  const mode = searchParams.get('mode') as 'application' | 'survey';
  const applicationType = searchParams
    .get('applicationType')
    ?.toUpperCase() as ApplicationType | null;
  const {
    handleSubmitForm,
    isApplicationPending,
    isSurveyPending,
    isApplicationSuccess,
    isSurveySuccess,
  } = useCreateFormMutation(id, type, mode, applicationType || 'REGISTER');
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
