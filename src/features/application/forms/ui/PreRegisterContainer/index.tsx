'use client';

import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { PrivacyConsent } from '@/entities/application';
import { adaptDynamicFormToSchema } from '@/features/form/common/lib/formAdapter';
import { FormValues as RendererFormValues } from '@/features/form/renderer/lib/visibilityEngine';
import { FormRenderer } from '@/features/form/renderer/ui';
import { withLoading } from '@/shared/hocs';
import { useGetApplicationForm } from '@/shared/queries/useGetApplicationForm';
import { DynamicFormValues } from '@/shared/types/application/type';
import { Button } from '@/shared/ui';
import {
  ApplicationSubmitError,
  ApplicationWaitResult,
  postApplication,
} from '../../../api/postApplication';
import { createSubmissionKeys } from '../../../lib/createSubmissionKeys';
import { createStandardApplicationFormatter } from '../../../lib/formatter/createStandardApplicationFormatter';
import { getApplicantLimit, getCompanionLimit } from '../../model/sessionSeats';
import { usePreRegisterCapacity } from '../../model/usePreRegister';

/**
 * 사전등록 신청. 입력 항목은 Form 서비스의 일반 참가자 사전 폼 정의를 그대로 그리고,
 * 대표자와 동행자(`COMPANION`)를 한 번에 신청 서비스로 보낸다.
 */
const PreRegisterContainer = ({
  expoId,
  sessionId,
}: {
  expoId: string;
  sessionId: string;
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    data: form,
    isLoading,
    error,
  } = useGetApplicationForm(expoId, 'STANDARD', 'PRE');
  const { data: capacity, error: sessionError } = usePreRegisterCapacity(
    expoId,
    sessionId,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  // 같은 내용을 다시 보내면(연타·네트워크 재시도·오류 뒤 재제출) 같은 키로 보낸다
  const submissionKeys = useRef(createSubmissionKeys());

  const questions = useMemo(() => form?.dynamicForm ?? [], [form]);
  const schema = useMemo(
    () => (form ? adaptDynamicFormToSchema(questions, form.title) : null),
    [form, questions],
  );

  const applicantLimit = capacity ? getApplicantLimit(capacity) : undefined;
  const companionLimit = capacity ? getCompanionLimit(capacity) : undefined;
  const canApply = applicantLimit === undefined || applicantLimit > 0;
  const companionFieldId = schema?.items.find(
    (item) => item.type === 'COMPANION',
  )?.id;
  const backHref = `/application/forms/${expoId}`;

  const onSubmit = async (
    data: RendererFormValues & { privacyConsent?: boolean },
  ) => {
    if (!data.privacyConsent) {
      toast.error('개인정보 제공 동의 여부를 체크해주세요');
      return;
    }

    setIsSubmitting(true);
    try {
      const formatted = createStandardApplicationFormatter(
        questions,
        'PRE',
      )(data as DynamicFormValues & { privacyConsent: boolean });
      const payload = { ...formatted, ...(sessionId && { sessionId }) };
      const result: ApplicationWaitResult | undefined = await postApplication(
        expoId,
        'application',
        'STANDARD',
        'PRE',
        payload,
        submissionKeys.current.keyFor(JSON.stringify(payload)),
      );
      // 202 PROCESSING: 대기에서 승급되는 중이다. 같은 키로 다시 눌러 결과를 확인한다
      if (result?.status === 'PROCESSING') {
        toast.info(
          '신청을 처리하고 있습니다. 잠시 후 다시 눌러 결과를 확인해주세요.',
        );
        return;
      }
      submissionKeys.current.reset();
      const waiting = result?.status === 'WAITING' ? '&result=waiting' : '';
      router.push(
        `/application/success/${expoId}?userType=STANDARD&formType=application${waiting}`,
      );
    } catch (submitError) {
      // 취소한 대기의 같은 키 재전송은 거절된다. 다시 신청하려면 새 키가 필요하다
      if (
        submitError instanceof ApplicationSubmitError &&
        submitError.code === 'WAITLIST_WITHDRAWN'
      )
        submissionKeys.current.reset();
      toast.error(
        submitError instanceof Error
          ? submitError.message
          : '사전등록에 실패했습니다',
      );
      // 제출 시 서버가 정원을 다시 판정해 일행 전체를 거절했을 수 있으므로 잔여석을 다시 받는다
      queryClient.invalidateQueries({
        queryKey: ['preRegisterCapacity', expoId, sessionId],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error)
    return (
      <p className="flex flex-1 items-center justify-center text-body1r text-gray-500">
        {error.message || '사전등록 신청서를 불러오지 못했습니다'}
      </p>
    );

  return withLoading({
    isLoading,
    children: (
      <div className="mt-30 flex w-full max-w-[816px] flex-col gap-30">
        <div className="flex flex-col gap-8 border-b-1 border-solid border-gray-200 pb-24">
          <p className="text-h2b text-black mobile:text-h3b">사전등록 신청</p>
          <p className="text-body2r text-gray-500">
            대표자가 함께 오는 사람까지 한 번에 신청합니다. 신청한 사람마다 QR이
            대표자 번호로 발송됩니다.
          </p>
        </div>

        {sessionError && (
          <div className="flex flex-col gap-8 rounded-sm border-1 border-solid border-error bg-white p-24">
            <p className="text-body2b text-error">
              잔여석을 불러오지 못했습니다
            </p>
            <p className="text-body2r text-gray-600">
              {sessionError.message} 남은 자리를 확인할 수 없어 신청을 진행할 수
              없습니다. 잠시 후 다시 시도하거나 다른 회차를 선택해 주세요.
            </p>
          </div>
        )}

        {capacity && (
          <div className="flex flex-col gap-8 rounded-sm border-1 border-solid border-main-300 bg-main-100 p-24">
            <p
              className={`text-body2b ${canApply ? 'text-main-600' : 'text-error'}`}
            >
              {canApply
                ? `현재 남은 자리 ${capacity.remaining.toLocaleString()}명`
                : '신청 마감'}
            </p>
            {canApply && (
              <p className="text-caption1r text-gray-600">
                1회 최대 {capacity.maxApplicants.toLocaleString()}명, 대표자를
                포함해 {applicantLimit?.toLocaleString()}명까지 신청할 수
                있습니다.
              </p>
            )}
            <p className="text-caption1r text-gray-500">
              화면의 남은 자리는 안내용입니다. 제출할 때 서버가 정원을 다시
              확인하며, 자리가 부족하면 일행 전체의 신청이 거절됩니다.
            </p>
          </div>
        )}

        {schema && (
          <FormRenderer
            schema={schema}
            onSubmit={onSubmit}
            companionMaxCount={companionLimit}
            renderFooter={(methods) => {
              const companionCount = companionFieldId
                ? ((methods.watch(companionFieldId) as unknown[] | undefined)
                    ?.length ?? 0)
                : 0;
              // 회차를 바꾸면 이미 추가한 동행자가 새 회차의 상한을 넘을 수 있다
              const isOverCapacity =
                applicantLimit !== undefined &&
                companionCount + 1 > applicantLimit;

              return (
                <div className="mt-48 flex flex-col gap-30">
                  <PrivacyConsent
                    content={form?.informationText ?? ''}
                    watch={methods.watch}
                    setValue={methods.setValue}
                  />
                  {isOverCapacity && (
                    <p className="text-body2r text-error">
                      이번에 신청할 수 있는 인원은 대표자를 포함해{' '}
                      {(applicantLimit ?? 0).toLocaleString()}명까지입니다.
                      인원을 줄이거나 다른 회차를 선택해 주세요.
                    </p>
                  )}

                  <div className="flex gap-16 mobile:flex-col-reverse">
                    <Link
                      href={backHref}
                      className="flex-1 rounded-sm bg-gray-100 px-24 py-14 text-center text-body2b text-gray-700"
                    >
                      프로그램 목록으로
                    </Link>
                    <div className="flex-1">
                      <Button
                        type="submit"
                        disabled={
                          isSubmitting ||
                          !!sessionError ||
                          !capacity ||
                          !canApply ||
                          isOverCapacity
                        }
                      >
                        {isSubmitting ? '신청 중...' : '신청 완료하기'}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            }}
          />
        )}
      </div>
    ),
  });
};

export default PreRegisterContainer;
