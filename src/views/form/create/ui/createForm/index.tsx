'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';

import {
  FormEditor,
  getOccupationOpenAtError,
  OccupationOpenAtField,
  OccupationOpenAtValue,
  toOccupationOpenAtRequest,
} from '@/features/form/common';
import { useCreateFormSubmit } from '@/features/form/create';
import { ApplicationType } from '@/shared/types/exhibition/type';
import { FormValues } from '@/shared/types/form/create/type';
import { Header } from '@/widgets/layout';

const CreateForm = ({ id }: { id: string }) => {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') as 'STANDARD' | 'TRAINEE';
  const mode = searchParams.get('mode') as 'application' | 'survey';
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const applicationType = searchParams
    .get('applicationType')
    ?.toUpperCase() as ApplicationType | null;
  const {
    handleSubmitForm,
    isApplicationPending,
    isSurveyPending,
    isApplicationSuccess,
    isSurveySuccess,
  } = useCreateFormSubmit(
    id,
    type,
    mode,
    applicationType || 'PRE',
    startDate || '',
    endDate || '',
  );
  // 유형별 오픈은 일반 사전등록만 쓴다. 끄고 만들면 null 로 보낸다
  const hasOccupationOpen =
    mode === 'application' &&
    type === 'STANDARD' &&
    (applicationType || 'PRE') === 'PRE';
  const [occupation, setOccupation] = useState<OccupationOpenAtValue>({
    enabled: false,
    local: '',
  });
  const occupationError = hasOccupationOpen
    ? getOccupationOpenAtError(occupation, startDate || '', endDate || '')
    : null;

  const handleSubmit = (values: FormValues) => {
    if (!hasOccupationOpen) return handleSubmitForm(values);
    if (occupationError) return toast.error(occupationError);
    handleSubmitForm(values, toOccupationOpenAtRequest(occupation));
  };

  return (
    <div className="flex min-h-screen flex-col gap-[30px]">
      <Header />
      <div className="flex flex-1 flex-col items-center gap-16 p-16">
        {hasOccupationOpen && (
          <OccupationOpenAtField
            value={occupation}
            onChange={setOccupation}
            startDate={startDate || ''}
            endDate={endDate || ''}
            error={occupationError}
          />
        )}
        <FormEditor
          expoId={id}
          type={type}
          mode={mode}
          onSubmit={handleSubmit}
          isLoading={isApplicationPending || isSurveyPending}
          isSuccess={isApplicationSuccess || isSurveySuccess}
        />
      </div>
    </div>
  );
};

export default CreateForm;
