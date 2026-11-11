'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import {
  FormEditor,
  getOccupationOpenAtError,
  OccupationOpenAtField,
  OccupationOpenAtValue,
  toOccupationOpenAtRequest,
} from '@/features/form/common';
import {
  FormStepKind,
  getPeriodError,
  useCreateFormStep,
} from '@/features/form/create';
import { FormValues } from '@/shared/types/form/create/type';
import { KstDateTimeInput } from '@/shared/ui';

const toDate = (value: string) => (value ? new Date(value) : null);

interface Props {
  expoId: string;
  kind: FormStepKind;
  onSaved: () => void;
}

/**
 * 2단계에서 고른 폼 하나의 작성 칸. 등록용 폼은 신청 기간을 이 칸 위에서 함께 정한다.
 * 탭을 옮겨도 입력이 남도록 부모가 숨기기만 하고 내리지 않는다
 */
const FormStepPanel = ({ expoId, kind, onSaved }: Props) => {
  const { submit, isPending, isSuccess } = useCreateFormStep(expoId, kind);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [occupation, setOccupation] = useState<OccupationOpenAtValue>({
    enabled: false,
    local: '',
  });

  const isApplication = kind.mode === 'application';
  // 유형별 오픈은 일반 사전등록만 쓴다
  const hasOccupationOpen =
    kind.mode === 'application' &&
    kind.userType === 'STANDARD' &&
    kind.applicationType === 'PRE';
  const periodError =
    isApplication && startDate && endDate
      ? getPeriodError({ startDate, endDate })
      : null;
  const occupationError = hasOccupationOpen
    ? getOccupationOpenAtError(occupation, startDate, endDate)
    : null;

  const handleSubmit = (values: FormValues) => {
    if (!isApplication) {
      submit(values).then(onSaved, () => {});
      return;
    }
    const error = getPeriodError({ startDate, endDate });
    if (error) return toast.error(error);
    if (occupationError) return toast.error(occupationError);
    submit(values, {
      startDate,
      endDate,
      ...(hasOccupationOpen && {
        occupationOpenAt: toOccupationOpenAtRequest(occupation),
      }),
    }).then(onSaved, () => {});
  };

  return (
    <div className="flex w-full flex-col items-center gap-16">
      {isApplication && (
        <section className="w-full max-w-[816px] space-y-12 rounded-sm border-1 border-solid border-gray-200 p-20">
          <div className="space-y-4">
            <p className="text-body2b text-black">신청 기간</p>
            <p className="break-keep text-caption1r text-gray-500">
              한국 시각 날짜·시·분으로 고릅니다.
            </p>
          </div>
          <div className="flex w-full items-center gap-12 mobile:flex-col">
            <KstDateTimeInput
              label="신청 시작 일시"
              value={toDate(startDate)}
              onChange={(date) => setStartDate(date?.toISOString() ?? '')}
            />
            <KstDateTimeInput
              label="신청 마감 일시"
              value={toDate(endDate)}
              onChange={(date) => setEndDate(date?.toISOString() ?? '')}
            />
          </div>
          {periodError && (
            <p role="alert" className="text-caption1r text-error">
              {periodError}
            </p>
          )}
        </section>
      )}
      {hasOccupationOpen && (
        <OccupationOpenAtField
          value={occupation}
          onChange={setOccupation}
          startDate={startDate}
          endDate={endDate}
          error={occupationError}
        />
      )}
      <FormEditor
        expoId={expoId}
        type={kind.userType}
        mode={kind.mode}
        onSubmit={handleSubmit}
        isLoading={isPending}
        isSuccess={isSuccess}
        hideBack
      />
    </div>
  );
};

export default FormStepPanel;
