import { MockDataBadge } from '@/shared/ui';
import { AdminPreregisterSummary } from '../../../common/api/preregisterSummaryApi';
import {
  PREREGISTER_OCCUPATION_ISSUE,
  usePreregisterOccupationSplit,
} from '../../mock/preregisterOccupation';

interface PreregisterBannerProps {
  expoId: string;
  summary: AdminPreregisterSummary;
}

/** 사전등록 전체 인원 한 줄 요약. 직업 구분 인원만 예시 데이터다 */
const PreregisterBanner = ({ expoId, summary }: PreregisterBannerProps) => {
  const { general, teacher } = usePreregisterOccupationSplit(expoId);

  return (
    <div className="flex flex-wrap items-center gap-x-16 gap-y-8 rounded-sm border-1 border-solid border-gray-200 bg-gray-100 px-24 py-16 mobile:px-16">
      <p className="text-body2b text-black">
        사전등록 {summary.sessions.length}개 회차
      </p>
      <p className="text-body2r text-gray-500">
        확정{' '}
        <span className="text-main-600">
          {summary.confirmedUniqueParticipants.toLocaleString()}
        </span>
        명 / 대기 {summary.waitingParticipants.toLocaleString()}명 · 확정 전
        예약 {summary.pendingReservations.toLocaleString()}건
      </p>
      <div className="flex flex-wrap items-center gap-8">
        <p className="text-body2r text-gray-500">
          일반 확정 {general.confirmed.toLocaleString()} / 대기{' '}
          {general.waiting.toLocaleString()} · 교원·예비교사 확정{' '}
          {teacher.confirmed.toLocaleString()} / 대기{' '}
          {teacher.waiting.toLocaleString()}
        </p>
        <MockDataBadge issue={PREREGISTER_OCCUPATION_ISSUE} />
      </div>
    </div>
  );
};

export default PreregisterBanner;
