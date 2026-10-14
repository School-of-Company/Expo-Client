import { AdminOccupation } from '../../../common/api/ledgerApi';
import {
  AdminPreregisterOccupationSummary,
  AdminPreregisterSummary,
} from '../../../common/api/preregisterSummaryApi';

// 교원·예비교사 묶음. 학교 교직원(SCHOOL_STAFF)은 넣지 않는다
const TEACHER_OCCUPATIONS: AdminOccupation[] = [
  'TEACHER',
  'PRE_SERVICE_TEACHER',
];

const sumOccupations = (items: AdminPreregisterOccupationSummary[]) =>
  items.reduce(
    (sum, { confirmedParticipants, waitingParticipants }) => ({
      confirmed: sum.confirmed + confirmedParticipants,
      waiting: sum.waiting + waitingParticipants,
    }),
    { confirmed: 0, waiting: 0 },
  );

/** 직업별 인원을 교원 외 · 교원·예비교사 · 미분류로 묶는다 */
const splitOccupations = (
  occupations: AdminPreregisterOccupationSummary[],
) => ({
  others: sumOccupations(
    occupations.filter(
      ({ occupation }) =>
        occupation !== null && !TEACHER_OCCUPATIONS.includes(occupation),
    ),
  ),
  teacher: sumOccupations(
    occupations.filter(
      ({ occupation }) =>
        occupation !== null && TEACHER_OCCUPATIONS.includes(occupation),
    ),
  ),
  unclassified: sumOccupations(
    occupations.filter(({ occupation }) => occupation === null),
  ),
});

const formatCount = ({
  confirmed,
  waiting,
}: {
  confirmed: number;
  waiting: number;
}) => `확정 ${confirmed.toLocaleString()} / 대기 ${waiting.toLocaleString()}`;

/** 사전등록 전체 인원 한 줄 요약 */
const PreregisterBanner = ({
  summary,
}: {
  summary: AdminPreregisterSummary;
}) => {
  const { others, teacher, unclassified } = splitOccupations(
    summary.occupations ?? [],
  );
  const hasUnclassified = unclassified.confirmed + unclassified.waiting > 0;

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
      <p className="text-body2r text-gray-500">
        교원 외 {formatCount(others)} · 교원·예비교사 {formatCount(teacher)}
        {hasUnclassified && ` · 직업 미분류 ${formatCount(unclassified)}`}
      </p>
    </div>
  );
};

export default PreregisterBanner;
