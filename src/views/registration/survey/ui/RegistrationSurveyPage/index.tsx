'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { LotterySettingsForm, SurveyManager } from '@/features/survey-admin';
import { Header } from '@/widgets/layout';
import { RegistrationTabs } from '@/widgets/registration';

const VIEWS = [
  { value: 'survey', label: '만족도 조사' },
  { value: 'lottery', label: '경품 추첨' },
];

/** 만족도 조사 문항과 경품 추첨을 한 페이지에서 오간다 */
const SurveyViews = () => {
  const { expoId } = useParams<{ expoId: string }>();
  const router = useRouter();
  const view =
    useSearchParams().get('view') === 'lottery' ? 'lottery' : 'survey';

  return (
    <div className="flex w-full flex-col items-center gap-36">
      <div role="tablist" className="flex justify-center gap-[18px]">
        {VIEWS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={view === value}
            onClick={() =>
              router.replace(value === 'lottery' ? '?view=lottery' : '?')
            }
            className={`text-h2b ${view === value ? 'text-black' : 'text-gray-500'}`}
          >
            {label}
          </button>
        ))}
      </div>
      {view === 'lottery' ? (
        <div className="w-full max-w-[816px]">
          <LotterySettingsForm expoId={expoId} />
        </div>
      ) : (
        <SurveyManager />
      )}
    </div>
  );
};

const RegistrationSurveyPage = () => {
  return (
    <div className="flex min-h-screen flex-col gap-[30px]">
      <Header />
      <RegistrationTabs />
      <div className="flex flex-1 justify-center p-16">
        <Suspense>
          <SurveyViews />
        </Suspense>
      </div>
    </div>
  );
};

export default RegistrationSurveyPage;
