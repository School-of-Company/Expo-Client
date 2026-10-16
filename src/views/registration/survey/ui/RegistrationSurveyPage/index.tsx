'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { LotterySettingsForm, SurveyManager } from '@/features/survey-admin';
import { TitleTabs } from '@/shared/ui';
import { PageShell } from '@/widgets/layout';

type SurveyView = 'survey' | 'lottery';

const VIEW_OPTIONS: { value: SurveyView; label: string }[] = [
  { value: 'survey', label: '만족도 조사' },
  { value: 'lottery', label: '경품 추첨' },
];

/** 만족도 조사 문항과 경품 추첨을 한 페이지의 두 탭으로 다룬다. 박람회 상세에서 들어오는 독립 페이지라 관리 탭 줄은 두지 않는다 */
const SurveyViews = () => {
  const { expoId } = useParams<{ expoId: string }>();
  const router = useRouter();
  const view: SurveyView =
    useSearchParams().get('view') === 'lottery' ? 'lottery' : 'survey';

  return (
    <div className="flex w-full flex-col items-center gap-36">
      <TitleTabs
        ariaLabel="만족도 조사·경품 추첨"
        value={view}
        options={VIEW_OPTIONS}
        onChange={(next) =>
          router.replace(next === 'lottery' ? '?view=lottery' : '?')
        }
      />
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

const RegistrationSurveyPage = () => (
  <PageShell>
    <Suspense>
      <SurveyViews />
    </Suspense>
  </PageShell>
);

export default RegistrationSurveyPage;
