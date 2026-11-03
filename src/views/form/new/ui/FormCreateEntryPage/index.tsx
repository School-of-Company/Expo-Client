'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import {
  FORM_CREATE_QUERY,
  FormCreateApplicationType,
  FormCreateMode,
  FormCreateSelection,
  FormCreateUserType,
  getFormCreatePath,
  getPeriodError,
  parseFormCreateSelection,
  toCompleteSelection,
  toSelectionQuery,
} from '@/features/form/create';
import { getRegistrationRoutes } from '@/shared/config';
import { Button, DetailHeader, KstDateTimeInput } from '@/shared/ui';
import { Header } from '@/widgets/layout';

const MODES: { value: FormCreateMode; label: string; description: string }[] = [
  {
    value: 'application',
    label: '등록용 폼',
    description: '행사 입장 사전·현장등록 신청서',
  },
  {
    value: 'survey',
    label: '만족도 조사',
    description: '행사 뒤 참가자·연수자 설문',
  },
  {
    value: 'program',
    label: '프로그램 폼',
    description: '프로그램·연수 회차 신청서',
  },
];

const USER_TYPES: { value: FormCreateUserType; label: string }[] = [
  { value: 'STANDARD', label: '참가자' },
  { value: 'TRAINEE', label: '연수자' },
];

const APPLICATION_TYPES: { value: FormCreateApplicationType; label: string }[] =
  [
    { value: 'PRE', label: '사전등록' },
    { value: 'FIELD', label: '현장등록' },
  ];

const toDate = (value: string | null) => (value ? new Date(value) : null);

interface OptionGroupProps<T extends string> {
  label: string;
  options: { value: T; label: string; description?: string }[];
  value: T | null;
  onChange: (value: T) => void;
}

const OptionGroup = <T extends string>({
  label,
  options,
  value,
  onChange,
}: OptionGroupProps<T>) => (
  <section className="flex flex-col gap-12">
    <p className="text-body1b text-black">{label}</p>
    <div
      role="radiogroup"
      aria-label={label}
      className="flex gap-8 mobile:flex-col"
    >
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(option.value)}
            className={`flex flex-1 flex-col gap-4 rounded-sm border-1 border-solid px-16 py-14 text-left ${
              isSelected
                ? 'border-main-600 bg-main-600 text-white'
                : 'border-gray-200 bg-white text-gray-600'
            }`}
          >
            <span className="text-body2b">{option.label}</span>
            {option.description && (
              <span
                className={`break-keep text-caption1r ${isSelected ? 'text-white' : 'text-gray-400'}`}
              >
                {option.description}
              </span>
            )}
          </button>
        );
      })}
    </div>
  </section>
);

/**
 * 폼 만들기 선택 화면. 종류·대상·등록 유형·신청 기간을 한 화면에서 고르고 폼 작성 화면으로 넘어간다.
 * 고른 값은 주소에 남겨, 작성 화면에서 뒤로 오거나 새로고침해도 그대로 보인다
 */
const FormCreateEntryPage = ({ expoId }: { expoId: string }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get(FORM_CREATE_QUERY.returnTo);
  const registrationRoutes = getRegistrationRoutes(expoId);

  const [selection, setSelection] = useState<FormCreateSelection>(() =>
    parseFormCreateSelection(searchParams),
  );
  const update = (next: Partial<FormCreateSelection>) =>
    setSelection((prev) => ({ ...prev, ...next }));

  // 고를 때마다 기록을 쌓지 않고 주소만 바꾼다. 브라우저 뒤로 가기는 이 화면 이전으로 간다
  const query = toSelectionQuery(selection, returnTo);
  useEffect(() => {
    if (query === searchParams.toString()) return;
    router.replace(`?${query}`, { scroll: false });
  }, [query, router, searchParams]);

  const { mode, userType, applicationType, startDate, endDate } = selection;
  const complete = toCompleteSelection(selection);
  const showPeriodError = mode === 'application' && !!startDate && !!endDate;
  const periodError = showPeriodError ? getPeriodError(selection) : null;
  const canProceed = mode === 'program' || !!complete;

  const handleBack = () =>
    router.push(
      returnTo === 'schedule'
        ? registrationRoutes.forms
        : `/admin/exhibition/detail/${encodeURIComponent(expoId)}`,
    );

  const handleNext = () => {
    if (mode === 'program') {
      // 신청관리에서 왔으면 신청관리 폼 탭으로, 아니면 박람회 상세로 돌아간다
      router.push(
        returnTo === 'schedule'
          ? registrationRoutes.programFormNew
          : `${registrationRoutes.programFormNew}?returnTo=detail`,
      );
      return;
    }
    if (complete) router.push(getFormCreatePath(expoId, complete, returnTo));
  };

  return (
    <div className="flex min-h-screen flex-col gap-[30px]">
      <Header />
      <div className="flex flex-1 justify-center p-16">
        <div className="flex w-full max-w-[816px] flex-col gap-32">
          <DetailHeader
            className="gap-12"
            onBack={handleBack}
            headerTitle="폼 만들기"
          />
          <p className="break-keep text-caption1r text-gray-500">
            이미 만든 등록용 폼·만족도 조사는{' '}
            <Link
              href={registrationRoutes.forms}
              className="text-main-600 underline"
            >
              신청관리 폼 탭
            </Link>
            에서 수정합니다.
          </p>

          <OptionGroup
            label="폼 종류"
            options={MODES}
            value={mode}
            onChange={(value) => update({ mode: value })}
          />

          {mode === 'program' && (
            <p className="break-keep rounded-sm border-1 border-solid border-gray-200 px-20 py-12 text-body2r text-gray-600">
              프로그램 폼은 대상과 응답 기간을 만들기 화면에서 정합니다. 만든 뒤
              신청관리의 회차에 연결해야 신청을 받을 수 있습니다.
            </p>
          )}

          {(mode === 'application' || mode === 'survey') && (
            <OptionGroup
              label="대상"
              options={USER_TYPES}
              value={userType}
              onChange={(value) => update({ userType: value })}
            />
          )}

          {mode === 'application' && (
            <>
              <OptionGroup
                label="등록 유형"
                options={APPLICATION_TYPES}
                value={applicationType}
                onChange={(value) => update({ applicationType: value })}
              />
              <section className="flex flex-col gap-12">
                <p className="text-body1b text-black">신청 기간</p>
                <p className="break-keep text-caption1r text-gray-500">
                  한국 시각 날짜·시·분으로 고릅니다.
                </p>
                <div className="flex w-full items-center gap-12 mobile:flex-col">
                  <KstDateTimeInput
                    label="신청 시작 일시"
                    value={toDate(startDate)}
                    onChange={(date) =>
                      update({ startDate: date?.toISOString() ?? null })
                    }
                  />
                  <KstDateTimeInput
                    label="신청 마감 일시"
                    value={toDate(endDate)}
                    onChange={(date) =>
                      update({ endDate: date?.toISOString() ?? null })
                    }
                  />
                </div>
                {periodError && (
                  <p role="alert" className="text-caption1r text-error">
                    {periodError}
                  </p>
                )}
              </section>
            </>
          )}

          <Button disabled={!canProceed} onClick={handleNext}>
            {mode === 'program' ? '프로그램 폼 만들기' : '폼 작성하기'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FormCreateEntryPage;
