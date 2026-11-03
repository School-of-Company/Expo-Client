'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import {
  FormEditor,
  getOccupationOpenAtError,
  OccupationOpenAtField,
  OccupationOpenAtValue,
  toOccupationOpenAtRequest,
} from '@/features/form/common';
import {
  CompleteFormSelection,
  FORM_CREATE_QUERY,
  parseFormCreateSelection,
  toCompleteSelection,
  toSelectionQuery,
  useCreateFormSubmit,
} from '@/features/form/create';
import { getExpoRoutes } from '@/shared/config';
import { FormValues } from '@/shared/types/form/create/type';
import { Loading } from '@/shared/ui';
import { Header } from '@/widgets/layout';

/**
 * 폼 작성 화면. 종류·대상·등록 유형·신청 기간은 폼 만들기 선택 화면에서 고른 값을 주소로 받는다.
 * 주소가 깨져 값이 모자라면 선택 화면으로 보내 남은 값으로 다시 고르게 한다
 */
const CreateForm = ({ id }: { id: string }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selection = toCompleteSelection(parseFormCreateSelection(searchParams));
  const returnTo = searchParams.get(FORM_CREATE_QUERY.returnTo);

  useEffect(() => {
    if (selection) return;
    const query = toSelectionQuery(
      parseFormCreateSelection(searchParams),
      returnTo,
    );
    router.replace(`${getExpoRoutes(id).formNew}${query ? `?${query}` : ''}`);
  }, [id, returnTo, router, searchParams, selection]);

  if (!selection)
    return (
      <div className="flex min-h-screen flex-col gap-[30px]">
        <Header />
        <Loading />
      </div>
    );

  return <CreateFormEditor id={id} selection={selection} />;
};

const CreateFormEditor = ({
  id,
  selection,
}: {
  id: string;
  selection: CompleteFormSelection;
}) => {
  const {
    userType: type,
    mode,
    applicationType,
    startDate,
    endDate,
  } = selection;
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
    applicationType,
    startDate ?? '',
    endDate ?? '',
  );
  // 유형별 오픈은 일반 사전등록만 쓴다. 끄고 만들면 null 로 보낸다
  const hasOccupationOpen =
    mode === 'application' && type === 'STANDARD' && applicationType === 'PRE';
  const [occupation, setOccupation] = useState<OccupationOpenAtValue>({
    enabled: false,
    local: '',
  });
  const occupationError = hasOccupationOpen
    ? getOccupationOpenAtError(occupation, startDate ?? '', endDate ?? '')
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
            startDate={startDate ?? ''}
            endDate={endDate ?? ''}
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
