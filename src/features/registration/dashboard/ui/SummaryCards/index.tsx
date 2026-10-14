import { MockDataBadge } from '@/shared/ui';
import { StatCard } from '../../../common';
import {
  PHONE_VERIFICATION_ISSUE,
  usePhoneVerificationSummary,
} from '../../mock/phoneVerification';

interface SummaryCardsProps {
  expoId: string;
  /** 불러오지 못한 값은 null 로 받아 '-' 로 보인다 */
  programCount: number | null;
  sessionCount: number | null;
  confirmed: number | null;
  waiting: number | null;
  uniqueParticipants: number | null;
}

/** 대시보드 맨 위 운영 규모·확정·대기·인증 숫자 */
const SummaryCards = ({
  expoId,
  programCount,
  sessionCount,
  confirmed,
  waiting,
  uniqueParticipants,
}: SummaryCardsProps) => {
  const phoneVerification = usePhoneVerificationSummary(expoId);

  return (
    <div className="grid grid-cols-4 gap-16 mobile:grid-cols-1 tablet:grid-cols-2">
      <StatCard
        label="운영 프로그램 / 회차"
        value={programCount?.toLocaleString() ?? '-'}
        unit="개 프로그램"
        sub={`총 ${sessionCount?.toLocaleString() ?? '-'}개 회차`}
      />
      <StatCard
        label="현재 신청 확정"
        value={confirmed?.toLocaleString() ?? '-'}
        unit="명"
        sub="모든 프로그램 합계"
        emphasis
      />
      <StatCard
        label="현재 대기자"
        value={waiting?.toLocaleString() ?? '-'}
        unit="명"
        sub="자동·수동 승급 대상"
      />
      <StatCard
        label="휴대전화 인증 / 참가자"
        value={phoneVerification.verifiedCount.toLocaleString()}
        unit="건 인증"
        sub={`등록 참가자 ${uniqueParticipants?.toLocaleString() ?? '-'}명`}
        badge={<MockDataBadge issue={PHONE_VERIFICATION_ISSUE} />}
      />
    </div>
  );
};

export default SummaryCards;
