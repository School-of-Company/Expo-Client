import { MockDataBadge } from '@/shared/ui';
import { StatCard } from '../../../common';
import { ACTIVE_QR_ISSUE, useActiveQrSummary } from '../../mock/activeQr';
import {
  APPLICATION_TRAFFIC_ISSUE,
  useApplicationTraffic,
} from '../../mock/applicationTraffic';
import { useTodayEntered } from '../../model/useTodayEntry';

interface MonitoringCardsProps {
  expoId: string;
  /** 신청을 받는 회차 수. 회차를 불러오지 못하면 null */
  openSessionCount: number | null;
}

/** 신청화면 접속량과 지금 열린 회차·QR·입장 현황 */
const MonitoringCards = ({
  expoId,
  openSessionCount,
}: MonitoringCardsProps) => {
  const traffic = useApplicationTraffic(expoId);
  const activeQr = useActiveQrSummary(expoId);
  const todayEntered = useTodayEntered(expoId);
  const trafficBadge = <MockDataBadge issue={APPLICATION_TRAFFIC_ISSUE} />;

  return (
    <div className="grid grid-cols-4 gap-16 mobile:grid-cols-1 tablet:grid-cols-2">
      <StatCard
        label="오늘 신청화면 조회 (PV)"
        value={traffic.today.pageViews.toLocaleString()}
        unit="회"
        sub="새로고침·탭 이동 포함"
        badge={trafficBadge}
      />
      <StatCard
        label="오늘 고유 접속 (UV)"
        value={traffic.today.uniqueVisitors.toLocaleString()}
        unit="명"
        sub="동일 접속자 하루 1회"
        badge={trafficBadge}
      />
      <StatCard
        label="누적 신청화면 조회"
        value={traffic.total.pageViews.toLocaleString()}
        unit="회"
        sub={`일별 UV 누적 ${traffic.total.uniqueVisitors.toLocaleString()}명`}
        badge={trafficBadge}
      />
      <StatCard
        label="현재 OPEN 회차 / 활성 QR"
        value={openSessionCount?.toLocaleString() ?? '-'}
        unit="개 회차"
        sub={`활성 QR ${activeQr.activeCount}개 · 오늘 입장 ${todayEntered?.toLocaleString() ?? '-'}건`}
        // 활성 QR 만 예시 데이터다. OPEN 회차와 오늘 입장은 실제 값이다
        badge={<MockDataBadge issue={ACTIVE_QR_ISSUE} />}
      />
    </div>
  );
};

export default MonitoringCards;
