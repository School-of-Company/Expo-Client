import { StatCard } from '../../../common';

interface SummaryCardsProps {
  /** 불러오지 못한 값은 null 로 받아 '-' 로 보인다 */
  programCount: number | null;
  sessionCount: number | null;
  confirmed: number | null;
  waiting: number | null;
  uniqueParticipants: number | null;
}

/** 대시보드 맨 위 운영 규모·프로그램 신청 확정·대기·고유 참가자 숫자 */
const SummaryCards = ({
  programCount,
  sessionCount,
  confirmed,
  waiting,
  uniqueParticipants,
}: SummaryCardsProps) => (
  <div className="grid grid-cols-4 gap-16 mobile:grid-cols-1 tablet:grid-cols-2">
    <StatCard
      label="운영 프로그램 / 회차"
      value={programCount?.toLocaleString() ?? '-'}
      unit="개 프로그램"
      sub={`총 ${sessionCount?.toLocaleString() ?? '-'}개 회차`}
    />
    <StatCard
      label="프로그램 신청 확정"
      value={confirmed?.toLocaleString() ?? '-'}
      unit="건"
      sub="모든 프로그램 회차 신청 건수 합계"
      emphasis
    />
    <StatCard
      label="프로그램 신청 대기"
      value={waiting?.toLocaleString() ?? '-'}
      unit="건"
      sub="자리가 나면 회차 정책에 따라 자동 승급"
    />
    {/* 휴대전화 인증 건수는 관리자용 공개 집계가 없어 숫자를 보이지 않는다 */}
    <StatCard
      label="프로그램 신청 고유 참가자"
      value={uniqueParticipants?.toLocaleString() ?? '-'}
      unit="명"
      sub="휴대전화 인증 건수: 집계 미연결"
    />
  </div>
);

export default SummaryCards;
