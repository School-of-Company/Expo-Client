'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { DropdownField, Occupation, OCCUPATION_OPTIONS } from '@/entities/form';
import { adaptDynamicFormToSchema } from '@/features/form/common/lib/formAdapter';
import { FormValues as RendererFormValues } from '@/features/form/renderer/lib/visibilityEngine';
import { FormRenderer } from '@/features/form/renderer/ui';
import { getQrSurvey } from '@/shared/api';
import { withLoading } from '@/shared/hocs';
import { Button, DetailHeader } from '@/shared/ui';
import { postQrSurveyAnswer } from '../../api/postQrSurveyAnswer';
import { buildSurveyAnswers } from '../../lib/process/buildSurveyAnswers';

const occupationOptions = OCCUPATION_OPTIONS.map(({ key, label }) => ({
  id: key,
  label,
  value: key,
}));

/** 현장 종이 QR 설문. 응답자가 익명이라 전화번호·개인정보 동의 대신 직업만 받는다. */
const QrSurveyContainer = ({ token }: { token: string }) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data, isLoading, error } = useQuery({
    queryKey: ['getQrSurvey', token],
    queryFn: () => getQrSurvey(token),
    retry: false,
  });

  const formSchema = useMemo(
    () =>
      data &&
      adaptDynamicFormToSchema(data.dynamicSurveyResponseDto ?? [], data.title),
    [data],
  );

  const onSubmit = async ({ occupation, ...values }: RendererFormValues) => {
    if (!data) return;
    setIsSubmitting(true);
    try {
      await postQrSurveyAnswer(token, {
        answers: buildSurveyAnswers(
          values,
          data.dynamicSurveyResponseDto ?? [],
        ),
        occupation: occupation as Occupation,
      });
      router.push(
        `/application/success/${data.expoId}?formType=survey&userType=STANDARD`,
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '설문 제출 실패');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="flex w-full max-w-[816px] flex-1 items-center justify-center text-body1r text-gray-500 mobile:text-body2r">
        {error.message}
      </div>
    );
  }

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
                <div className="flex flex-col gap-20 rounded-sm border-1 border-solid border-gray-200 p-18">
                  <div className="flex items-center gap-2">
                    <p className="text-h3b text-black">직업</p>
                    <p className="text-main-600">*</p>
                  </div>
                  <DropdownField
                    name="occupation"
                    options={occupationOptions}
                    required
                    register={methods.register}
                    setValue={methods.setValue}
                  />
                </div>
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

export default QrSurveyContainer;
