'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useMemo, useRef } from 'react';
import { toast } from 'react-toastify';
import { PrivacyConsent } from '@/entities/application';
import { useFormQuery } from '@/entities/form';
import { adaptDynamicFormToSchema } from '@/features/form/common/lib/formAdapter';
import { FormValues as RendererFormValues } from '@/features/form/renderer/lib/visibilityEngine';
import { FormRenderer } from '@/features/form/renderer/ui';
import { withLoading } from '@/shared/hocs';
import { DynamicFormValues } from '@/shared/types/application/type';
import { ApplicationType } from '@/shared/types/exhibition/type';
import { DetailHeader, Button } from '@/shared/ui';
import { postApplication } from '../../api/postApplication';
import { createSubmissionKeys } from '../../lib/createSubmissionKeys';
import { getFormatter } from '../../lib/formatterService';

const ApplicationFormContainer = ({ params }: { params: string }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userType = searchParams.get('userType') as 'STANDARD' | 'TRAINEE';
  const applicationType = (searchParams.get('applicationType') ||
    'PRE') as ApplicationType;

  const {
    data: formList,
    isLoading,
    error,
  } = useFormQuery(params, userType, applicationType);

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
      router.push(
        `/application/success/${params}?userType=${userType}&formType=application`,
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : '폼 등록에 실패했습니다',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="flex w-full max-w-[816px] flex-1 items-center justify-center text-body1r text-gray-500 mobile:text-body2r">
        {error.message ?? '박람회 폼 조회를 실패했습니다'}
      </div>
    );
  }

  return withLoading({
    isLoading,
    children: (
      <div className="flex w-full max-w-[816px] flex-1 flex-col gap-30 overflow-y-auto">
        <div className="mt-30">
          <DetailHeader headerTitle={formList?.title ?? ''} />
        </div>

        {formSchema && (
          <FormRenderer
            schema={formSchema}
            onSubmit={onSubmit}
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
