'use client';

import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { PrivacyConsent } from '@/entities/application';
import {
  getOccupationLabels,
  OccupationLabelsProvider,
  useFormQuery,
} from '@/entities/form';
import { adaptDynamicFormToSchema } from '@/features/form/common/lib/formAdapter';
import { FormValues as RendererFormValues } from '@/features/form/renderer/lib/visibilityEngine';
import { FormRenderer } from '@/features/form/renderer/ui';
import {
  SessionIssue,
  SessionNotice,
  getSessionIssue,
  useRequireParticipantSession,
} from '@/features/phone-verification';
import { formatDefinitionSchedule } from '@/features/registration/common/model/ledger';
import { withLoading } from '@/shared/hocs';
import { DynamicFormValues } from '@/shared/types/application/type';
import { Button } from '@/shared/ui';
import {
  ApplicationSubmitError,
  ApplicationWaitResult,
  postApplication,
} from '../../../api/postApplication';
import { createSubmissionKeys } from '../../../lib/createSubmissionKeys';
import { createStandardApplicationFormatter } from '../../../lib/formatter/createStandardApplicationFormatter';
import { findRegistrationAnswerError } from '../../../lib/process/findRegistrationAnswerError';
import { useFieldRelease } from '../../model/fieldRelease';
import {
  getApplicantLimit,
  getCompanionLimit,
  getWaitingLimit,
  isWaitingParty,
} from '../../model/sessionSeats';
import {
  usePreRegisterCapacity,
  usePreRegisterSessions,
} from '../../model/usePreRegister';
import PreRegisterSessionSelect from '../PreRegisterSessionSelect';

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
  const { isVerified } = useRequireParticipantSession(expoId);
  const {
    data: form,
    isLoading,
    error,
  } = useFormQuery(expoId, 'STANDARD', 'PRE');
  const { data: capacity, error: sessionError } = usePreRegisterCapacity(
    expoId,
    sessionId,
  );
  // 고른 회차의 일정을 보여 준다. 목록을 못 받아도 신청은 잔여석 조회로 판단한다
  const { data: sessions } = usePreRegisterSessions(expoId);
  const selectedSession = sessions?.find(
    (session) => String(session.id) === sessionId,
  );
  // 행사 시작일 00:00(KST) 이후(켜둔 화면 포함)에는 일반 사전등록 작성을 닫고 현장등록으로 안내한다. 서버 접수 제한은 따로 유지된다
  const field = useFieldRelease(expoId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionIssue, setSessionIssue] = useState<SessionIssue>();
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

    // 서버는 일반 사전등록의 회차 ID를 양수 숫자로 필수로 받는다
    const session = Number(sessionId);
    if (!Number.isInteger(session) || session <= 0) {
      toast.error('신청할 회차를 선택해주세요');
      return;
    }

    const answerError = findRegistrationAnswerError(
      data as DynamicFormValues,
      questions,
    );
    if (answerError) {
      toast.error(answerError);
      return;
    }

    setIsSubmitting(true);
    try {
      const formatted = createStandardApplicationFormatter(
        questions,
        'PRE',
      )(data as DynamicFormValues & { privacyConsent: boolean });
      const payload = { ...formatted, sessionId: session };
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
      // 신청 폼 모음의 내 신청·대기 현황이 이전 결과를 보여 주지 않게 한다
      queryClient.invalidateQueries({ queryKey: ['myApplications', expoId] });
      queryClient.invalidateQueries({
        queryKey: ['myPreRegisterWaitlist', expoId],
      });
      // 서버가 대기로 접수하면(202) 확정이 아니므로 성공 페이지가 대기 접수와 순번을 안내한다
      const waiting =
        result?.status === 'WAITING'
          ? `&status=${result.status}${result.position ? `&position=${encodeURIComponent(result.position)}` : ''}`
          : '';
      router.push(
        `/application/success/${expoId}?userType=STANDARD&formType=application${waiting}`,
      );
    } catch (submitError) {
      setSessionIssue(getSessionIssue(submitError));
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

  if (field.released)
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-16 text-body1r text-gray-500 mobile:text-body2r">
        <p>일반 사전등록은 종료되었습니다. 현장 등록을 이용해주세요.</p>
        <Link
          href={`/application/${expoId}?formType=application&userType=STANDARD&applicationType=FIELD`}
          className="text-main-600 underline"
        >
          현장 등록하기
        </Link>
        <Link
          href={`/application/forms/${expoId}`}
          className="text-main-600 underline"
        >
          신청 폼 목록으로 돌아가기
        </Link>
      </div>
    );

  if (error)
    return (
      <p className="flex flex-1 items-center justify-center text-body1r text-gray-500">
        {error.message || '사전등록 신청서를 불러오지 못했습니다'}
      </p>
    );

  // 휴대폰 인증 전에는 회차 선택도 신청서도 보여 주지 않는다
  if (!isVerified) return withLoading({ isLoading: true, children: null });

  // 회차 없이 들어온 링크는 회차를 고르게 한다. 임의 회차로 신청시키지 않는다
  if (!sessionId) return <PreRegisterSessionSelect expoId={expoId} />;

  return withLoading({
    isLoading,
    children: (
      <div className="mt-30 flex w-full max-w-[816px] flex-col gap-30">
        {sessionIssue && <SessionNotice expoId={expoId} issue={sessionIssue} />}
        <div className="flex flex-col gap-8 border-b-1 border-solid border-gray-200 pb-24">
          <p className="text-h2b text-black mobile:text-h3b">사전등록 신청</p>
          <p className="text-body2r text-gray-500">
            대표자가 함께 오는 사람까지 한 번에 신청합니다. 신청한 사람마다 QR이
            대표자 번호로 발송됩니다.
          </p>
          {/* 확정된 사전등록은 내 신청에서 동행자를 더할 수 있다(Expo-Application-Server#169) */}
          {companionFieldId && (
            <p className="break-keep text-body2r text-gray-500">
              신청이 확정된 뒤에도 내 신청에서 대표자를 포함해 5명까지 동행자를
              추가할 수 있습니다. 추가할 때 남은 자리를 다시 확인합니다.
            </p>
          )}
        </div>

        <div className="flex items-start justify-between gap-16 rounded-sm border-1 border-solid border-gray-200 p-24 mobile:flex-col mobile:gap-8 mobile:p-16">
          <div className="flex min-w-0 flex-col gap-4">
            <p className="text-caption1r text-gray-500">신청 회차</p>
            {selectedSession ? (
              <>
                <p className="break-keep text-body1b text-black mobile:text-body2b">
                  {selectedSession.title}
                </p>
                <p className="text-body2r text-gray-600">
                  {formatDefinitionSchedule(
                    selectedSession.startedAt,
                    selectedSession.endedAt,
                  )}
                </p>
                {selectedSession.place && (
                  <p className="break-words break-keep text-body2r text-gray-500">
                    장소: {selectedSession.place}
                  </p>
                )}
              </>
            ) : (
              <p className="text-body2r text-gray-600">
                {sessions
                  ? '회차 정보를 찾을 수 없습니다'
                  : `회차 ${sessionId}`}
              </p>
            )}
          </div>
          <Link
            href={`/application/forms/${expoId}/pre-register`}
            className="flex-none text-body2b text-main-600 underline"
          >
            다른 회차 선택
          </Link>
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
              {!canApply
                ? '신청 마감'
                : capacity.remaining > 0
                  ? `현재 남은 자리 ${capacity.remaining.toLocaleString()}명`
                  : '정원 마감 · 대기 신청 가능'}
            </p>
            {canApply && (
              <p className="text-caption1r text-gray-600">
                대표자를 포함해 {applicantLimit?.toLocaleString()}명까지 신청할
                수 있습니다. 한 일행은 나뉘지 않고 모두 확정되거나 모두 대기로
                접수됩니다.
                {getWaitingLimit(capacity) === 0 &&
                  ' 이 회차는 대기를 받지 않아 자리가 부족하면 신청이 거절됩니다.'}
              </p>
            )}
            <p className="text-caption1r text-gray-500">
              화면의 남은 자리는 안내용입니다. 제출할 때 서버가 정원을 다시
              확인하며, 자리가 부족하면 일행 전체의 신청이 거절됩니다.
            </p>
          </div>
        )}

        {schema && (
          <OccupationLabelsProvider value={getOccupationLabels(questions)}>
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

                const willWait =
                  !!capacity &&
                  !isOverCapacity &&
                  isWaitingParty(capacity, companionCount + 1);

                return (
                  <div className="mt-48 flex flex-col gap-30">
                    <PrivacyConsent
                      content={form?.informationText ?? ''}
                      watch={methods.watch}
                      setValue={methods.setValue}
                    />
                    {willWait && (
                      <p className="text-body2b text-main-600">
                        이 인원은 확정 자리가 부족해 일행 전체가 대기로
                        접수됩니다. 대기는 자리가 나야 확정되며 최종 판정은
                        제출할 때 서버가 합니다.
                      </p>
                    )}
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
                        신청 폼 모음으로
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
          </OccupationLabelsProvider>
        )}
      </div>
    ),
  });
};

export default PreRegisterContainer;
