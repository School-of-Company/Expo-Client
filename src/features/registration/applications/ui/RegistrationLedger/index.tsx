'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { SegmentTabs, useRegistrationExpo } from '../../../common';
import ApplicationLedger from '../ApplicationLedger';
import PreregisterLedger from '../PreregisterLedger';

type LedgerTab = 'program' | 'pre';

const TAB_OPTIONS: { value: LedgerTab; label: string }[] = [
  { value: 'pre', label: '사전등록' },
  { value: 'program', label: '프로그램·연수' },
];

const RegistrationLedger = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { expoId } = useRegistrationExpo();
  const tab: LedgerTab = searchParams.get('tab') === 'pre' ? 'pre' : 'program';

  // 탭 전환 시 검색·페이지·회차 조건을 URL 에서 비워 다른 탭 조건이 섞이지 않게 한다
  const handleTabChange = (next: LedgerTab) =>
    router.replace(next === 'pre' ? '?tab=pre' : '?');

  return (
    <div className="flex w-full max-w-[1200px] flex-1 flex-col gap-24">
      <SegmentTabs
        ariaLabel="접수 관리대장 구분"
        value={tab}
        options={TAB_OPTIONS}
        onChange={handleTabChange}
      />
      {tab === 'pre' ? (
        <PreregisterLedger key={expoId} />
      ) : (
        // key: 탭/행사 전환 시 선택·필터·모달 상태 초기화
        <ApplicationLedger key={expoId} />
      )}
    </div>
  );
};

export default RegistrationLedger;
