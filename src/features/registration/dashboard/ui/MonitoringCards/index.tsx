import { MockDataBadge } from '@/shared/ui';
import { StatCard } from '../../../common';
import { ACTIVE_QR_ISSUE, useActiveQrSummary } from '../../mock/activeQr';
import {
  APPLICATION_TRAFFIC_ISSUE,
  useApplicationTraffic,
} from '../../mock/applicationTraffic';

interface MonitoringCardsProps {
  expoId: string;
  /** 회차를 불러오지 못하면 null */
  openSessionCount: number | null;
  closedSessionCount: number | null;
}

/** 신청화면 접속량과 지금 열린 회차·QR. 대시보드 오른쪽 좁은 열에 세로로 쌓는다 */
const MonitoringCards = ({
  expoId,
  openSessionCount,
  closedSessionCount,
}: MonitoringCardsProps) => {
  const traffic = useApplicationTraffic(expoId);
  const activeQr = useActiveQrSummary(expoId);
  const trafficBadge = <MockDataBadge issue={APPLICATION_TRAFFIC_ISSUE} />;

  return (
    <div className="grid grid-cols-1 gap-12 mobile:!grid-cols-1 tablet:grid-cols-2">
      <StatCard
        label="모집 중 회차"
        value={openSessionCount?.toLocaleString() ?? '-'}
        unit="개"
        sub={`마감 ${closedSessionCount?.toLocaleString() ?? '-'}개`}
        emphasis
      />
      <StatCard
        label="오늘 신청화면 조회 (PV)"
        value={traffic.today.pageViews.toLocaleString()}
        unit="회"
        sub={`고유 접속 ${traffic.today.uniqueVisitors.toLocaleString()}명 (UV)`}
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
        label="활성 QR"
        value={activeQr.activeCount.toLocaleString()}
        unit="개"
        sub="인쇄 QR 중 사용 중지하지 않은 수"
        badge={<MockDataBadge issue={ACTIVE_QR_ISSUE} />}
      />
    </div>
  );
};

export default MonitoringCards;
