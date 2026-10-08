'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
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
  createIdempotencyKey,
  postApplication,
} from '../../../api/postApplication';
import { createStandardApplicationFormatter } from '../../../lib/formatter/createStandardApplicationFormatter';
import { PreRegisterSession } from '../../api/preRegister';
import { usePreRegisterSession } from '../../model/usePreRegister';

const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토'];
const pad = (value: number) => String(value).padStart(2, '0');
const time = (date: Date) =>
  `${pad(date.getHours())}:${pad(date.getMinutes())}`;

/** "10월 31일 (토) 09:30 ~ 12:30" */
const formatSession = (startedAt: string, endedAt: string) => {
  const start = new Date(startedAt);
  return `${start.getMonth() + 1}월 ${start.getDate()}일 (${WEEKDAY[start.getDay()]}) ${time(start)} ~ ${time(new Date(endedAt))}`;
};

const getSessionStatus = (session: PreRegisterSession) => {
  const remaining = session.capacity - session.confirmedCount;
  const waitingRemaining = session.waitingCapacity - session.waitingCount;

  if (remaining > 0)
    return {
      canApply: true,
      label: `현재 신청 가능 · 잔여 ${remaining.toLocaleString()}명`,
    };
  if (waitingRemaining > 0)
    return {
      canApply: true,
      label: `정원 마감 · 대기 신청 가능 · 대기 잔여 ${waitingRemaining.toLocaleString()}명`,
    };
  return { canApply: false, label: '신청 마감' };
};

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
  const {
    data: form,
    isLoading,
    error,
  } = useGetApplicationForm(expoId, 'STANDARD', 'PRE');
  const { data: session } = usePreRegisterSession(expoId, sessionId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questions = useMemo(() => form?.dynamicForm ?? [], [form]);
  const schema = useMemo(
    () => (form ? adaptDynamicFormToSchema(questions, form.title) : null),
    [form, questions],
  );

  const status = session ? getSessionStatus(session) : null;
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
      await postApplication(
        expoId,
        'application',
        'STANDARD',
        'PRE',
        formatted,
        createIdempotencyKey(),
      );
      router.push(
        `/application/success/${expoId}?userType=STANDARD&formType=application`,
      );
    } catch (submitError) {
      toast.error(
        submitError instanceof Error
          ? submitError.message
          : '사전등록에 실패했습니다',
      );
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

        {session && status && (
          <div className="flex flex-col gap-8 rounded-sm border-1 border-solid border-main-300 bg-main-100 p-24">
            <p className="text-body1b text-black">{session.title}</p>
            <ul className="flex flex-col gap-4 text-body2r text-gray-600">
              <li>
                일시 · {formatSession(session.startedAt, session.endedAt)}
              </li>
              <li>
                장소 · {session.place} · 정원{' '}
                {session.capacity.toLocaleString()}명 / 대기{' '}
                {session.waitingCapacity.toLocaleString()}명
              </li>
            </ul>
            <p
              className={`text-body2b ${status.canApply ? 'text-main-600' : 'text-error'}`}
            >
              {status.label}
            </p>
          </div>
        )}

        {schema && (
          <FormRenderer
            schema={schema}
            onSubmit={onSubmit}
            renderFooter={(methods) => (
              <div className="mt-48 flex flex-col gap-30">
                <PrivacyConsent
                  content={form?.informationText ?? ''}
                  watch={methods.watch}
                  setValue={methods.setValue}
                />
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
                      disabled={isSubmitting || status?.canApply === false}
                    >
                      {isSubmitting ? '신청 중...' : '신청 완료하기'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          />
        )}
      </div>
    ),
  });
};

export default PreRegisterContainer;
