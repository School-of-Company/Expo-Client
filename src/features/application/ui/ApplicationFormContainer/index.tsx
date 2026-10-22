'use client';

import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useMemo, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import { PrivacyConsent } from '@/entities/application';
import { useFormQuery } from '@/entities/form';
import { adaptDynamicFormToSchema } from '@/features/form/common/lib/formAdapter';
import { FormValues as RendererFormValues } from '@/features/form/renderer/lib/visibilityEngine';
import { FormRenderer } from '@/features/form/renderer/ui';
import {
  SessionIssue,
  SessionNotice,
  getSessionIssue,
  loadVerifiedPhone,
  useRequireParticipantSession,
} from '@/features/phone-verification';
import { getExpoRoutes } from '@/shared/config';
import { withLoading } from '@/shared/hocs';
import { DynamicFormValues } from '@/shared/types/application/type';
import { ApplicationType } from '@/shared/types/exhibition/type';
import { DetailHeader, Button } from '@/shared/ui';
import {
  ApplicationSubmitError,
  postApplication,
} from '../../api/postApplication';
import { useFieldRelease } from '../../forms/model/fieldRelease';
import { useFieldVisitParty } from '../../forms/model/useFieldVisits';
import { useParticipantExpoDetail } from '../../forms/model/useParticipantExpoDetail';
import FieldVisitRegistration from '../../forms/ui/FieldVisitRegistration';
import { createSubmissionKeys } from '../../lib/createSubmissionKeys';
import { getFormatter } from '../../lib/formatterService';
import { findRegistrationAnswerError } from '../../lib/process/findRegistrationAnswerError';

const ALREADY_PREREGISTERED_TODAY = 'ALREADY_PREREGISTERED_TODAY';
// 방문일 원장이 켜진 서버는 번호 단위 현장등록을 막고 기존 참가자 선택 화면을 요구한다
const FIELD_VISIT_SELECTION_REQUIRED = 'FIELD_VISIT_SELECTION_REQUIRED';

const ApplicationFormContainer = ({ params }: { params: string }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const userType = searchParams.get('userType') as 'STANDARD' | 'TRAINEE';
  const applicationType = (searchParams.get('applicationType') ||
    'PRE') as ApplicationType;

  const {
    data: formList,
    isLoading,
    error,
  } = useFormQuery(params, userType, applicationType);

  // 현장 등록은 행사 시작일 00:00(KST) 전에는 작성·제출 진입을 막는다. 서버의 접수 제한은 따로 유지된다
  const field = useFieldRelease(params);
  const isFieldPending =
    applicationType === 'FIELD' &&
    !field.isLoading &&
    !field.isError &&
    !field.released;
  // 일반 현장등록은 휴대폰 인증 뒤 제출한다(세션이 없으면 서버가 401 SESSION_REQUIRED). 설정을 못 받으면 인증 필요로 본다
  const isStandardField =
    userType === 'STANDARD' && applicationType === 'FIELD';
  const { data: expo, isError: isExpoError } = useParticipantExpoDetail(params);
  const verificationRequired = !isStandardField
    ? false
    : expo || isExpoError
      ? expo?.participantPhoneVerificationRequired !== false
      : undefined;
  const { isVerified } = useRequireParticipantSession(
    params,
    verificationRequired,
  );
  // 서버는 입력값 대신 인증한 번호로 저장하므로 그 번호를 채우고 잠근다
  const [verifiedPhone] = useState(() => loadVerifiedPhone(params));
  const phoneFieldId = formList?.dynamicForm?.find(
    (question) => question.dynamicFormType === 'PHONE_NUMBER',
  )?.id;
  const lockedPhone =
    verificationRequired && verifiedPhone && phoneFieldId !== undefined
      ? { fieldId: String(phoneFieldId), value: verifiedPhone }
      : undefined;
  const [sessionIssue, setSessionIssue] = useState<SessionIssue>();
  // 인증한 번호의 기존 일행과 오늘 방문일 등록 상태를 먼저 조회한다. 끝나기 전에는 빈 신규 폼을 열지 않는다
  const fieldParty = useFieldVisitParty(
    params,
    isStandardField && verificationRequired === true && isVerified,
  );
  const [selectionRequired, setSelectionRequired] = useState(false);
  const showFieldVisits =
    !!fieldParty.party &&
    (fieldParty.party.participants.length > 0 || selectionRequired);
  // 그날 회차에 확정된 사전등록이 있는 번호는 현장등록 대신 받은 QR로 입장한다(Expo-Application-Server#261)
  const [isPreregisteredToday, setIsPreregisteredToday] = useState(false);

  // 행사가 시작되면 예전 일반 사전등록 폼 주소는 사전등록 종료 안내로 보낸다
  const isClosedStandardPre =
    userType === 'STANDARD' && applicationType === 'PRE' && field.released;
  useEffect(() => {
    if (isClosedStandardPre)
      router.replace(`/application/forms/${params}/pre-register`);
  }, [isClosedStandardPre, params, router]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  // 같은 내용의 재제출(연타·네트워크 재시도)은 같은 Idempotency-Key 로 보낸다
  const submissionKeys = useRef(createSubmissionKeys());

  const formSchema = useMemo(() => {
    if (!formList) return null;
    return adaptDynamicFormToSchema(formList.dynamicForm ?? [], formList.title);
  }, [formList]);

  const onSubmit = async (
    data: RendererFormValues & { privacyConsent?: boolean },
  ): Promise<void> => {
    if (!data.privacyConsent) {
      toast.error('개인정보 제공 동의 여부를 체크해주세요');
      return;
    }

    const answerError = findRegistrationAnswerError(
      data as DynamicFormValues,
      formList?.dynamicForm ?? [],
    );
    if (answerError) {
      toast.error(answerError);
      return;
    }

    setIsSubmitting(true);

    try {
      const { privacyConsent, ...rest } = data;
      const dynamicFormValues = rest as DynamicFormValues;
      const allQuestions = formList?.dynamicForm ?? [];

      const formatter = getFormatter(userType, allQuestions, applicationType);

      const formattedData = formatter({
        ...dynamicFormValues,
        privacyConsent,
      } as DynamicFormValues & { privacyConsent: boolean });

      if (
        userType === 'STANDARD' &&
        applicationType === 'FIELD' &&
        !('phoneNumber' in formattedData && formattedData.phoneNumber)
      ) {
        toast.error(
          '휴대폰 번호가 없으면 현장 관리자에게 종이 QR을 요청해주세요.',
        );
        return;
      }

      await postApplication(
        params,
        'application',
        userType,
        applicationType,
        formattedData,
        submissionKeys.current.keyFor(JSON.stringify(formattedData)),
      );
      // 내 신청·대기 현황이 신청 전 결과(최대 1분 캐시)를 보여 주지 않게 한다
      ['myApplications', 'myPreRegisterWaitlist', 'participantQr'].forEach(
        (key) => queryClient.invalidateQueries({ queryKey: [key, params] }),
      );
      router.push(
        `/application/success/${params}?userType=${userType}&formType=application&applicationType=${applicationType}`,
      );
    } catch (error) {
      if (
        error instanceof ApplicationSubmitError &&
        error.code === FIELD_VISIT_SELECTION_REQUIRED
      ) {
        setSelectionRequired(true);
        fieldParty.refetch();
        toast.info('기존 참가자를 확인한 뒤 오늘 현장등록을 진행해주세요.');
        return;
      }
      setSessionIssue(getSessionIssue(error));
      setIsPreregisteredToday(
        error instanceof ApplicationSubmitError &&
          error.code === ALREADY_PREREGISTERED_TODAY,
      );
      toast.error(
        error instanceof Error ? error.message : '폼 등록에 실패했습니다',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (applicationType === 'FIELD' && field.isError) {
    return (
      <div className="flex w-full max-w-[816px] flex-1 flex-col items-center justify-center gap-16 text-body1r text-gray-500 mobile:text-body2r">
        <p role="alert">행사 정보를 불러오지 못했습니다.</p>
        <button
          type="button"
          onClick={() => field.refetch()}
          className="text-main-600 underline"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (isFieldPending) {
    return (
      <div className="flex w-full max-w-[816px] flex-1 flex-col items-center justify-center gap-16 text-body1r text-gray-500 mobile:text-body2r">
        <p>현장 등록은 행사 시작일부터 신청할 수 있습니다. (공개 예정)</p>
        <Link
          href={`/application/forms/${params}`}
          className="text-main-600 underline"
        >
          신청 폼 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  // 조회 실패를 미등록으로 보지 않는다. 신규 폼 대신 오류와 재시도를 보여 준다
  if (isStandardField && !fieldParty.party && fieldParty.sessionIssue) {
    return (
      <div className="flex w-full max-w-[816px] flex-1 flex-col justify-center">
        <SessionNotice expoId={params} issue={fieldParty.sessionIssue} />
      </div>
    );
  }

  if (isStandardField && !fieldParty.party && fieldParty.errorMessage) {
    return (
      <div className="flex w-full max-w-[816px] flex-1 flex-col items-center justify-center gap-16 text-body1r text-gray-500 mobile:text-body2r">
        <p role="alert">{fieldParty.errorMessage}</p>
        <button
          type="button"
          onClick={() => fieldParty.refetch()}
          className="text-main-600 underline"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex w-full max-w-[816px] flex-1 items-center justify-center text-body1r text-gray-500 mobile:text-body2r">
        {error.message ?? '박람회 폼 조회를 실패했습니다'}
      </div>
    );
  }

  return withLoading({
    isLoading:
      isLoading ||
      (applicationType === 'FIELD' && field.isLoading) ||
      !isVerified ||
      fieldParty.isLoading ||
      isClosedStandardPre,
    children: (
      <div className="flex w-full max-w-[816px] flex-1 flex-col gap-30 overflow-y-auto">
        <div className="mt-30">
          <DetailHeader headerTitle={formList?.title ?? ''} />
        </div>

        {(sessionIssue ?? fieldParty.sessionIssue) && (
          <SessionNotice
            expoId={params}
            issue={(sessionIssue ?? fieldParty.sessionIssue)!}
          />
        )}
        {isPreregisteredToday && (
          <div
            role="alert"
            className="flex flex-col gap-8 rounded-sm border-1 border-solid border-error bg-white p-24"
          >
            <p className="text-body2b text-error">
              이미 사전등록하셨습니다. 받으신 QR로 입장해 주세요.
            </p>
            <p className="text-body2r text-gray-600">
              오늘 회차에 확정된 사전등록이 있어 현장등록을 하지 않아도 됩니다.
              QR을 다시 보려면 내 신청에서 확인해주세요.
            </p>
            <Link
              href={getExpoRoutes(params).applicationMy}
              className="self-start text-body2b text-main-600 underline"
            >
              내 신청·QR 보기
            </Link>
          </div>
        )}

        {showFieldVisits && fieldParty.party && (
          <FieldVisitRegistration
            expoId={params}
            party={fieldParty.party}
            isRefreshing={fieldParty.isFetching}
            dynamicForm={formList?.dynamicForm}
          />
        )}

        {formSchema && !showFieldVisits && (
          <FormRenderer
            schema={formSchema}
            onSubmit={onSubmit}
            lockedPhone={lockedPhone}
            renderFooter={(methods) => (
              <div className="mt-48 flex flex-col gap-30">
                <PrivacyConsent
                  content={formList?.informationText ?? ''}
                  watch={methods.watch}
                  setValue={methods.setValue}
                />
                <Button disabled={isSubmitting} type="submit">
                  {isSubmitting ? '등록 중...' : '등록하기'}
                </Button>
              </div>
            )}
          />
        )}
      </div>
    ),
  });
};

export default ApplicationFormContainer;
