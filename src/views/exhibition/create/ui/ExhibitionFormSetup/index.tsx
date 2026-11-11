'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FormStepKind } from '@/features/form/create';
import { getExpoRoutes, getRegistrationRoutes } from '@/shared/config';
import { hasUnsavedChanges, LEAVE_CONFIRM_MESSAGE } from '@/shared/model';
import { Button } from '@/shared/ui';
import { Header } from '@/widgets/layout';
import CreateSteps from '../CreateSteps';
import FormStepPanel from './FormStepPanel';

interface FormOption {
  key: string;
  label: string;
  description: string;
  kind: FormStepKind;
}

const FORM_OPTIONS: FormOption[] = [
  {
    key: 'STANDARD-PRE',
    label: '참가자 사전등록',
    description: '행사 전 일반 참가자 신청서',
    kind: { mode: 'application', userType: 'STANDARD', applicationType: 'PRE' },
  },
  {
    key: 'STANDARD-FIELD',
    label: '참가자 현장등록',
    description: '행사 당일 현장 신청서',
    kind: {
      mode: 'application',
      userType: 'STANDARD',
      applicationType: 'FIELD',
    },
  },
  {
    key: 'TRAINEE-PRE',
    label: '연수자 사전등록',
    description: '교원 연수자 사전 신청서',
    kind: { mode: 'application', userType: 'TRAINEE', applicationType: 'PRE' },
  },
  {
    key: 'TRAINEE-FIELD',
    label: '연수자 현장등록',
    description: '교원 연수자 현장 신청서',
    kind: {
      mode: 'application',
      userType: 'TRAINEE',
      applicationType: 'FIELD',
    },
  },
  {
    key: 'STANDARD-SURVEY',
    label: '참가자 만족도 조사',
    description: '행사 뒤 참가자 설문',
    kind: { mode: 'survey', userType: 'STANDARD' },
  },
  {
    key: 'TRAINEE-SURVEY',
    label: '연수자 만족도 조사',
    description: '행사 뒤 연수자 설문',
    kind: { mode: 'survey', userType: 'TRAINEE' },
  },
];

const labelOf = (key: string) =>
  FORM_OPTIONS.find((option) => option.key === key)?.label ?? key;

/**
 * 박람회 생성 2단계. 만들 폼을 고르면 탭으로 열려, 박람회 상세·폼 만들기 화면을 오가지 않고 한 화면에서 차례로 저장한다.
 * 폼은 저장 단위가 하나씩이라 탭마다 따로 저장하고, 저장한 폼은 탭에 표시한다
 */
const ExhibitionFormSetup = ({ expoId }: { expoId: string }) => {
  const router = useRouter();
  const expoRoutes = getExpoRoutes(expoId);
  const registrationRoutes = getRegistrationRoutes(expoId);

  const [selected, setSelected] = useState<string[]>(['STANDARD-PRE']);
  const [active, setActive] = useState<string | null>('STANDARD-PRE');
  const [saved, setSaved] = useState<string[]>([]);

  const ordered = FORM_OPTIONS.filter((option) =>
    selected.includes(option.key),
  );
  const unsaved = selected.filter((key) => !saved.includes(key));

  const toggle = (key: string) => {
    if (saved.includes(key)) return;
    if (!selected.includes(key)) {
      setSelected((prev) => [...prev, key]);
      setActive(key);
      return;
    }
    if (
      !window.confirm(
        `${labelOf(key)} 폼을 빼면 작성한 내용이 사라집니다. 뺄까요?`,
      )
    )
      return;
    const next = selected.filter((value) => value !== key);
    setSelected(next);
    if (active === key) {
      setActive(
        FORM_OPTIONS.find((option) => next.includes(option.key))?.key ?? null,
      );
    }
  };

  const handleSaved = (key: string) => {
    setSaved((prev) => [...prev, key]);
    // 아직 저장하지 않은 다음 폼으로 넘어간다
    const nextKey = FORM_OPTIONS.find(
      (option) =>
        option.key !== key &&
        selected.includes(option.key) &&
        !saved.includes(option.key),
    )?.key;
    if (nextKey) setActive(nextKey);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinish = () => {
    if (unsaved.length > 0 || hasUnsavedChanges()) {
      const names = unsaved.map(labelOf).join(', ');
      const message = names
        ? `아직 저장하지 않은 폼이 있습니다(${names}). 저장하지 않고 끝낼까요?\n폼은 나중에 박람회 상세에서도 만들 수 있습니다.`
        : LEAVE_CONFIRM_MESSAGE;
      if (!window.confirm(message)) return;
    }
    router.push(expoRoutes.detail);
  };

  return (
    <div className="flex min-h-screen flex-col gap-[30px]">
      <Header />
      <div className="flex flex-1 flex-col items-center gap-32 p-16">
        <CreateSteps current={2} />

        <section className="flex w-full max-w-[816px] flex-col gap-12">
          <div className="space-y-4">
            <p className="text-h3b text-black">만들 폼 고르기</p>
            <p className="break-keep text-caption1r text-gray-500">
              박람회가 만들어졌습니다. 필요한 폼을 고르면 아래에 탭으로
              열립니다. 지금 만들지 않은 폼은 나중에 박람회 상세에서 만들 수
              있습니다.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-8 mobile:grid-cols-1">
            {FORM_OPTIONS.map((option) => {
              const isSelected = selected.includes(option.key);
              const isSaved = saved.includes(option.key);
              return (
                <button
                  key={option.key}
                  type="button"
                  role="checkbox"
                  aria-checked={isSelected}
                  disabled={isSaved}
                  onClick={() => toggle(option.key)}
                  className={`flex flex-col gap-4 rounded-sm border-1 border-solid px-16 py-14 text-left ${
                    isSelected
                      ? 'border-main-600 bg-main-600 text-white'
                      : 'border-gray-200 bg-white text-gray-600'
                  } ${isSaved ? 'cursor-default opacity-70' : ''}`}
                >
                  <span className="text-body2b">
                    {isSaved ? '✓ ' : ''}
                    {option.label}
                  </span>
                  <span
                    className={`break-keep text-caption1r ${isSelected ? 'text-white' : 'text-gray-400'}`}
                  >
                    {isSaved ? '저장됨' : option.description}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="break-keep text-caption1r text-gray-500">
            프로그램·연수 회차 신청서는{' '}
            <Link
              href={`${registrationRoutes.programFormNew}?returnTo=detail`}
              className="text-main-600 underline"
            >
              프로그램 폼 만들기
            </Link>
            에서 만든 뒤 신청관리의 회차에 연결합니다.
          </p>
        </section>

        {ordered.length > 0 && (
          <div
            role="tablist"
            aria-label="작성할 폼"
            className="flex w-full max-w-[816px] gap-4 overflow-x-auto border-b-1 border-solid border-gray-200"
          >
            {ordered.map((option) => {
              const isActive = option.key === active;
              const isSaved = saved.includes(option.key);
              return (
                <button
                  key={option.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActive(option.key)}
                  className={`flex-none whitespace-nowrap border-b-2 border-solid px-16 py-10 text-body2b ${
                    isActive
                      ? 'border-main-600 text-main-600'
                      : 'border-transparent text-gray-400'
                  }`}
                >
                  {option.label}
                  {isSaved && <span className="ml-4">✓</span>}
                </button>
              );
            })}
          </div>
        )}

        {ordered.map((option) => (
          <div
            key={option.key}
            role="tabpanel"
            hidden={option.key !== active}
            className="w-full"
          >
            <FormStepPanel
              expoId={expoId}
              kind={option.kind}
              onSaved={() => handleSaved(option.key)}
            />
          </div>
        ))}

        <div className="flex w-full max-w-[816px] flex-col gap-8">
          {selected.length > 0 && unsaved.length === 0 && (
            <p className="text-center text-body2r text-main-600">
              고른 폼을 모두 저장했습니다.
            </p>
          )}
          <Button
            variant={unsaved.length === 0 ? 'default' : 'gray'}
            onClick={handleFinish}
          >
            {unsaved.length === 0 ? '완료하고 박람회 상세로' : '나중에 하기'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExhibitionFormSetup;
