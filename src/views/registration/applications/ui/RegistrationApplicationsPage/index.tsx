'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { ParticipantTable } from '@/features/exhibition/participants';
import { RegistrationLedger } from '@/features/registration/applications';
import { SegmentTabs } from '@/features/registration/common';
import { PageShell } from '@/widgets/layout';
import { RegistrationTabs } from '@/widgets/registration';

const VIEW_OPTIONS = [
  { value: 'ledger', label: '접수대장' },
  { value: 'roster', label: '입장자 명단' },
];

/**
 * 접수대장 페이지. 접수대장과 입장자 명단을 한 탭 줄에서 오간다.
 * 접수대장이 ?tab 을 쓰고 조건을 바꿀 때 쿼리를 비우므로, 이 탭은 ?view 로 따로 둔다
 */
const LedgerViews = () => {
  const { expoId } = useParams<{ expoId: string }>();
  const router = useRouter();
  const view = useSearchParams().get('view') === 'roster' ? 'roster' : 'ledger';

  return (
    <div className="flex w-full max-w-[1200px] flex-1 flex-col gap-24">
      <SegmentTabs
        ariaLabel="접수대장·입장자 명단"
        value={view}
        options={VIEW_OPTIONS}
        // 다른 화면의 검색·페이지 조건이 섞이지 않게 쿼리를 비우고 옮긴다
        onChange={(next) =>
          router.replace(next === 'roster' ? '?view=roster' : '?')
        }
      />
      {view === 'roster' ? (
        <ParticipantTable id={expoId} />
      ) : (
        <RegistrationLedger />
      )}
    </div>
  );
};

const RegistrationApplicationsPage = () => (
  <PageShell subHeader={<RegistrationTabs />}>
    <Suspense>
      <LedgerViews />
    </Suspense>
  </PageShell>
);

export default RegistrationApplicationsPage;
