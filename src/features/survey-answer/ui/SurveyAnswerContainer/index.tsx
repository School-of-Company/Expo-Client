'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { PrivacyConsent } from '@/entities/application';
import { adaptDynamicFormToSchema } from '@/features/form/common/lib/formAdapter';
import { FormValues as RendererFormValues } from '@/features/form/renderer/lib/visibilityEngine';
import { FormRenderer } from '@/features/form/renderer/ui';
import { withLoading } from '@/shared/hocs';
import { useGetSurveyForm } from '@/shared/queries';
import { DynamicFormValues } from '@/shared/types/application/type';
import { Button, DetailHeader } from '@/shared/ui';
import { postSurveyAnswer } from '../../api/postSurveyAnswer';
import { createSurveyFormatter } from '../../lib/createSurveyFormatter';
import SurveySubmitted from '../SurveySubmitted';

const isUserType = (value: string | null): value is 'STANDARD' | 'TRAINEE' =>
  value === 'STANDARD' || value === 'TRAINEE';

/** 일반 참가자·교원연수자 만족도 조사. 응답자는 본인 인증 뒤 붙는 phoneNumber 쿼리로 확인한다. */
const SurveyAnswerContainer = ({ expoId }: { expoId: string }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const rawUserType = searchParams.get('userType');
  const userType = isUserType(rawUserType) ? rawUserType : 'STANDARD';
  const phoneNumber = searchParams.get('phoneNumber');

  // 서버가 전화번호로 응답자를 찾으므로, 번호 없이 들어오면 설문을 채우기 전에 본인 인증으로 보낸다
  useEffect(() => {
    if (!isUserType(rawUserType) || phoneNumber) return;
    const redirect = `${pathname}?${searchParams.toString()}`;
    router.replace(
      `/phone-verification?expoId=${encodeURIComponent(expoId)}&redirect=${encodeURIComponent(redirect)}`,
    );
  }, [expoId, pathname, phoneNumber, rawUserType, router, searchParams]);

  const { data, isLoading, error } = useGetSurveyForm(
    expoId,
    userType,
    'PRE',
    isUserType(rawUserType) && !!phoneNumber,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const questions = useMemo(() => data?.dynamicSurveyResponseDto ?? [], [data]);
  const formSchema = useMemo(
    () => data && adaptDynamicFormToSchema(questions, data.title),
    [data, questions],
  );

  const onSubmit = async ({
    privacyConsent,
    ...values
  }: RendererFormValues & { privacyConsent?: boolean }) => {
    if (!privacyConsent) {
      toast.error('개인정보 제공 동의 여부를 체크해주세요');
      return;
    }

    setIsSubmitting(true);
    try {
      const format = createSurveyFormatter(questions, phoneNumber);
      await postSurveyAnswer(
        expoId,
        userType,
        format({ ...(values as DynamicFormValues), privacyConsent }),
      );
      setIsSubmitted(true);
      window.scrollTo({ top: 0 });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : '만족도 조사 제출 실패',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isUserType(rawUserType)) {
    return (
      <div className="flex w-full max-w-[816px] flex-1 items-center justify-center text-body1r text-gray-500 mobile:text-body2r">
        잘못된 설문 링크입니다. 링크를 다시 확인해주세요.
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex w-full max-w-[816px] flex-1 items-center justify-center text-body1r text-gray-500 mobile:text-body2r">
        {error.message ?? '만족도 조사를 불러오지 못했습니다'}
      </div>
    );
  }

  if (isSubmitted) return <SurveySubmitted />;

  return withLoading({
    isLoading,
    children: (
      <div className="flex w-full max-w-[816px] flex-1 flex-col gap-30 overflow-y-auto">
        <div className="mt-30">
          <DetailHeader headerTitle={data?.title ?? ''} />
        </div>

        {formSchema && (
          <FormRenderer
            schema={formSchema}
            onSubmit={onSubmit}
            renderFooter={(methods) => (
              <div className="mt-48 flex flex-col gap-30">
                <PrivacyConsent
                  content={data?.informationText ?? ''}
                  watch={methods.watch}
                  setValue={methods.setValue}
                />
                <Button disabled={isSubmitting} type="submit">
                  {isSubmitting ? '제출 중...' : '제출하기'}
                </Button>
              </div>
            )}
          />
        )}
      </div>
    ),
  });
};

export default SurveyAnswerContainer;
