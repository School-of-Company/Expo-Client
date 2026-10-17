import { StatCard } from '../../../common';
import { useActiveQrSummary } from '../../model/activeQr';
import { useApplicationPageViews } from '../../model/applicationPageViews';

interface MonitoringCardsProps {
  expoId: string;
  /** 모집 상태별 회차 수. 회차를 불러오지 못하면 null */
  sessionCounts: { open: number; closed: number; unset: number } | null;
}

/** 신청화면 접속량과 지금 열린 회차·QR. 위쪽 요약 카드와 같은 너비로 한 줄에 둔다 */
const MonitoringCards = ({ expoId, sessionCounts }: MonitoringCardsProps) => {
  const { data: pageViews, isError: isPageViewsError } =
    useApplicationPageViews(expoId);
  const { data: activeQr, isError: isActiveQrError } =
    useActiveQrSummary(expoId);
  // 불러오지 못하면 '-' 로 두고 이유는 보조 문구로 알린다
  const formatCount = (value?: number) => value?.toLocaleString() ?? '-';
  const pageViewsError = isPageViewsError && !pageViews;

  return (
    <div className="grid grid-cols-4 gap-16 mobile:grid-cols-1 tablet:grid-cols-2">
      <StatCard
        label="모집 중 회차"
        value={formatCount(sessionCounts?.open)}
        unit="개"
        sub={
          sessionCounts
            ? `마감 ${formatCount(sessionCounts.closed)}개 · 모집 설정 필요 ${formatCount(sessionCounts.unset)}개`
            : '회차를 불러오지 못했습니다.'
        }
        emphasis
      />
      <StatCard
        label="오늘 신청화면 조회 (PV)"
        value={formatCount(pageViews?.today.pageViews)}
        unit="회"
        sub={
          pageViewsError
            ? '조회 수를 불러오지 못했습니다.'
            : `고유 방문(참고) ${formatCount(pageViews?.today.uniqueVisitors)}명 (UV)`
        }
      />
      <StatCard
        label="누적 신청화면 조회"
        value={formatCount(pageViews?.totalPageViews)}
        unit="회"
        sub={
          pageViewsError
            ? '조회 수를 불러오지 못했습니다.'
            : `일별 UV 누적 ${formatCount(pageViews?.totalDailyVisitors)}명`
        }
      />
      <StatCard
        label="활성 QR"
        value={formatCount(activeQr?.active)}
        unit="개"
        sub={
          isActiveQrError && !activeQr
            ? '발급 현황을 불러오지 못했습니다.'
            : `인쇄 QR 중 사용 중 · 중지 ${formatCount(activeQr?.revoked)}개`
        }
      />
    </div>
  );
};

export default MonitoringCards;
