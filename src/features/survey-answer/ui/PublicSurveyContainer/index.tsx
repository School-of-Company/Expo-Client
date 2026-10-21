'use client';

import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { PrivacyConsent } from '@/entities/application';
import { DropdownField, Occupation, OCCUPATION_OPTIONS } from '@/entities/form';
import {
  PublicSurveyAnswerResponseDto,
  submitPublicSurveyAnswer,
  usePublicSurveyQuery,
} from '@/entities/survey';
import { buildSurveyAnswers } from '@/features/application/lib/process/buildSurveyAnswers';
import { adaptDynamicFormToSchema } from '@/features/form/common/lib/formAdapter';
import { FormValues as RendererFormValues } from '@/features/form/renderer/lib/visibilityEngine';
import { FormRenderer } from '@/features/form/renderer/ui';
import { withLoading } from '@/shared/hocs';
import { Button, DetailHeader, Input } from '@/shared/ui';
import SurveySubmitted from '../SurveySubmitted';

const occupationOptions = OCCUPATION_OPTIONS.map(({ key, label }) => ({
  id: key,
  label,
  value: key,
}));

// 서버와 같은 규칙: 하이픈·공백을 지운 뒤 01로 시작하는 10~11자리
const normalizePhoneNumber = (value: string) => value.replace(/[\s-]/g, '');
const isValidPhoneNumber = (value: string) => /^01\d{8,9}$/.test(value);

/** 공개 링크 설문. 응답자가 익명이라 직업만 받고, 경품 추첨이 켜진 설문에서만 전화번호를 선택으로 받는다. */
const PublicSurveyContainer = ({ expoId }: { expoId: string }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [result, setResult] = useState<PublicSurveyAnswerResponseDto | null>(
    null,
  );
  const { data, isLoading, error } = usePublicSurveyQuery(expoId);

  const formSchema = useMemo(
    () =>
      data &&
      adaptDynamicFormToSchema(data.dynamicSurveyResponseDto ?? [], data.title),
    [data],
  );

  const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber);
  const lotteryPhoneNumber =
    data?.lotteryEnabled && normalizedPhoneNumber
      ? normalizedPhoneNumber
      : undefined;

  const onSubmit = async ({
    occupation,
    privacyConsent,
    ...values
  }: RendererFormValues & { privacyConsent?: boolean }) => {
    if (!data) return;
    if (lotteryPhoneNumber) {
      if (!isValidPhoneNumber(lotteryPhoneNumber)) {
        toast.error('전화번호 형식을 확인해 주세요.');
        return;
      }
      if (!privacyConsent) {
        toast.error('전화번호를 입력하려면 개인정보 수집에 동의해 주세요.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const answerResult = await submitPublicSurveyAnswer(expoId, {
        answers: buildSurveyAnswers(
          values,
          data.dynamicSurveyResponseDto ?? [],
        ),
        occupation: occupation as Occupation,
        ...(lotteryPhoneNumber && {
          phoneNumber: lotteryPhoneNumber,
          personalInformationStatus: true,
        }),
      });
      setResult(answerResult);
      window.scrollTo({ top: 0 });
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

  if (result) {
    return (
      <SurveySubmitted>
        {result.won && (
          <div className="flex flex-col items-center gap-8 rounded-sm border-1 border-solid border-main-600 p-24">
            <p className="text-center text-h2b text-main-600 mobile:text-body1b">
              축하합니다! 경품에 당첨되었습니다.
            </p>
            <p className="break-keep text-center text-body2r text-gray-500">
              {lotteryPhoneNumber
                ? '입력하신 번호로 안내 문자를 보내 드립니다. 이 화면도 함께 보관해 주세요.'
                : '이 화면을 현장 운영 요원에게 보여 주세요.'}
            </p>
          </div>
        )}
      </SurveySubmitted>
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
                    watch={methods.watch}
                  />
                </div>
                {data?.lotteryEnabled && (
                  <div className="flex flex-col gap-20 rounded-sm border-1 border-solid border-gray-200 p-18">
                    <div className="flex flex-col gap-8">
                      <p className="text-h3b text-black">행운 이벤트</p>
                      <p className="break-keep text-body2r text-gray-500">
                        행운 이벤트에 참여하려면 전화번호를 입력해 주세요.
                        입력은 선택이며, 당첨되면 입력하신 번호로 안내 문자를
                        보내 드립니다.
                      </p>
                    </div>
                    <Input
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      placeholder="01012345678"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                    {lotteryPhoneNumber && (
                      <PrivacyConsent
                        content={data.informationText ?? ''}
                        watch={methods.watch}
                        setValue={methods.setValue}
                      />
                    )}
                  </div>
                )}
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

export default PublicSurveyContainer;
