'use client';

import { useQuery } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { FieldValues, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  CompanionField,
  formKeys,
  getForm,
  getOccupationLabels,
  OccupationLabelsProvider,
} from '@/entities/form';
import {
  SessionIssue,
  SessionNotice,
  getSessionIssue,
} from '@/features/phone-verification';
import { useModalDialog } from '@/shared/model';
import { Companion } from '@/shared/types/application/type';
import { createSubmissionKeys } from '../../../lib/createSubmissionKeys';
import { processCompanions } from '../../../lib/process/processFormField';
import { AddCompanionsResult } from '../../api/myApplications';
import { useOccupationLock } from '../../model/occupationOpen';

export interface AddCompanionTarget {
  applicationId: string;
  /** "홍길동 · 사전등록" */
  title: string;
  /** 회차 이름과 일정 */
  session: string;
  /** 지금 더 추가할 수 있는 동행자 수(서버 remainingCompanionSlots) */
  remaining: number;
}

const RESULT_MESSAGE: Record<
  AddCompanionsResult['status'],
  (result: AddCompanionsResult, count: number) => string
> = {
  CONFIRMED: (_, count) =>
    `동행자 ${count}명을 추가했습니다. QR은 대표자 번호로 발송됩니다.`,
  WAITING: ({ position }) =>
    `자리가 모자라 추가한 동행자가 대기로 접수되었습니다${position ? `(대기 ${position}번)` : ''}. 자리가 나면 확정됩니다.`,
  PROCESSING: () =>
    '동행자 추가를 처리하고 있습니다. 잠시 후 신청 현황을 다시 확인해주세요.',
};

/**
 * 이미 확정된 내 사전등록 일행에 동행자를 더한다. 추가할 수 있는 인원은 서버가 정한 남은 인원까지다.
 * 정원·상한·기간의 최종 판정은 서버가 하고, 자리가 모자라면 대기로 받을 수 있다
 */
const AddCompanionDialog = ({
  target,
  isSubmitting,
  onSubmit,
  onClose,
  expoId,
}: {
  expoId: string;
  target: AddCompanionTarget;
  isSubmitting: boolean;
  onSubmit: (body: {
    applicationId: string;
    companions: Companion[];
    idempotencyKey: string;
  }) => Promise<AddCompanionsResult>;
  onClose: () => void;
}) => {
  const dialogRef = useModalDialog({ onClose });
  const { control, register, handleSubmit } = useForm<FieldValues>({
    defaultValues: { companions: [] },
  });
  // 같은 내용을 다시 보내면(연타·네트워크 오류 뒤 재시도) 같은 키로 보내 서버가 이어서 처리하게 한다
  const submissionKeys = useRef(createSubmissionKeys());
  const [errorMessage, setErrorMessage] = useState<string>();
  const [sessionIssue, setSessionIssue] = useState<SessionIssue>();
  // 유형별 오픈 시각 전에는 교원·예비교사만 더할 수 있다(서버 #209). 신청 목록·일정 화면과 같은 키라 캐시를 같이 쓴다
  const preForm = useQuery({
    queryKey: formKeys.detail(expoId, 'STANDARD', 'PRE'),
    queryFn: () => getForm(expoId, 'STANDARD', 'PRE'),
    retry: false,
    meta: { silent: true },
  });
  const occupationLock = useOccupationLock(preForm.data?.occupationOpenAt);

  const submit = handleSubmit(async (values) => {
    const companions = processCompanions(values.companions);
    setErrorMessage(undefined);
    setSessionIssue(undefined);
    try {
      const result = await onSubmit({
        applicationId: target.applicationId,
        companions,
        idempotencyKey: submissionKeys.current.keyFor(
          JSON.stringify(companions),
        ),
      });
      const message = RESULT_MESSAGE[result.status](result, companions.length);
      if (result.status === 'CONFIRMED') toast.success(message);
      else toast.info(message);
      onClose();
    } catch (error) {
      setSessionIssue(getSessionIssue(error));
      setErrorMessage((error as Error).message);
    }
  });

  return (
    <div
      className="fixed inset-0 z-10 flex items-center justify-center px-[18px]"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="일행에 사람 추가"
        tabIndex={-1}
        className="flex max-h-[90vh] w-full max-w-[480px] flex-col gap-16 overflow-y-auto rounded-sm bg-white p-24 outline-none mobile:p-18"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-col gap-4">
          <p className="text-h3b text-black">일행에 사람 추가</p>
          <p className="break-keep text-body2r text-gray-500">
            {target.title}
            <br />
            {target.session}
          </p>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-16">
          <OccupationLabelsProvider
            value={getOccupationLabels(preForm.data?.dynamicForm)}
          >
            <CompanionField
              name="companions"
              label="동행자"
              required
              maxCount={target.remaining}
              limitHint={`이 일행에는 ${target.remaining}명까지 더 추가할 수 있습니다(대표자 포함 최대 5명).`}
              allowedOccupations={occupationLock?.allowed}
              occupationNotice={occupationLock?.notice}
              control={control}
              register={register}
            />
          </OccupationLabelsProvider>

          {sessionIssue ? (
            <SessionNotice expoId={expoId} issue={sessionIssue} />
          ) : (
            errorMessage && (
              <p role="alert" className="break-keep text-body2r text-error">
                {errorMessage}
              </p>
            )
          )}

          <p className="break-keep text-caption1r text-gray-500">
            남은 자리는 추가할 때 서버가 다시 확인합니다. 자리가 모자라면 대기로
            접수될 수 있습니다.
          </p>

          <div className="flex w-full gap-8">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-sm bg-gray-100 px-24 py-14 text-body2b text-gray-700"
            >
              닫기
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-sm bg-main-600 px-24 py-14 text-body2b text-white disabled:bg-main-300"
            >
              {isSubmitting ? '추가 중...' : '추가하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCompanionDialog;
