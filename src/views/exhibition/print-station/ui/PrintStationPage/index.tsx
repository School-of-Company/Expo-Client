'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  BadgePrintJobsPanel,
  BadgePrintStationPanel,
  BadgePrintStationPicker,
} from '@/features/exhibition/badge-print';

const STATION_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * 명찰 출력대 노트북 전용 화면. 실수로 로그아웃하면 같은 관리자 계정의 다른 노트북도 함께 끊길 수 있어
 * 로그아웃 메뉴가 있는 공통 헤더를 두지 않는다
 */
const PrintStationPage = ({ expoId }: { expoId: string }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const stationParam = searchParams.get('stationId');
  const stationId =
    stationParam && STATION_ID_PATTERN.test(stationParam)
      ? stationParam.toLowerCase()
      : null;

  // 주소에 출력대를 남겨, 그 주소를 바로가기로 저장하면 다음부터 같은 출력대로 열린다
  const selectStation = (id: string) =>
    router.replace(`${pathname}?stationId=${encodeURIComponent(id)}`);

  return (
    <div className="flex min-h-screen justify-center p-16">
      <div className="flex w-full max-w-[960px] flex-col gap-24">
        <div className="flex flex-col gap-4">
          <p className="text-h2b text-black">명찰 출력대</p>
          <p className="break-keep text-caption1r text-gray-500">
            Chrome을 --kiosk-printing 옵션으로 실행하면 확인 창 없이 기본
            프린터로 바로 출력됩니다. 이 화면을 켜 둔 채로 두세요.
          </p>
        </div>
        {stationId ? (
          <>
            <BadgePrintStationPanel expoId={expoId} stationId={stationId} />
            <BadgePrintJobsPanel expoId={expoId} />
          </>
        ) : (
          <BadgePrintStationPicker expoId={expoId} onSelect={selectStation} />
        )}
      </div>
    </div>
  );
};

export default PrintStationPage;
