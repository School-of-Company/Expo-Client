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

/** 사전등록 전체 인원 요약. 회차 수 · 인원 · 직업별 인원을 칸으로 나눠 보여 준다 */
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
    <div className="grid grid-cols-[auto_1fr_1fr] divide-x-1 divide-solid divide-gray-200 rounded-sm border-1 border-solid border-gray-200 tablet:grid-cols-1 tablet:divide-x-0 tablet:divide-y-1">
      <div className="flex items-center px-24 py-16 mobile:px-16">
        <p className="whitespace-nowrap text-body1b text-black">
          사전등록 {summary.sessions.length}개 회차
        </p>
      </div>
      <div className="flex items-center px-24 py-16 mobile:px-16">
        <p className="text-body2r text-gray-500">
          확정{' '}
          <span className="text-body1b text-main-600">
            {summary.confirmedUniqueParticipants.toLocaleString()}
          </span>
          명 / 대기{' '}
          <span className="text-body1b text-black">
            {summary.waitingParticipants.toLocaleString()}
          </span>
          명 · 확정 전 예약 {summary.pendingReservations.toLocaleString()}건
        </p>
      </div>
      <div className="flex items-center px-24 py-16 mobile:px-16">
        <p className="text-body2r text-gray-500">
          교원 외 {formatCount(others)} · 교원·예비교사 {formatCount(teacher)}
          {hasUnclassified && ` · 직업 미분류 ${formatCount(unclassified)}`}
        </p>
      </div>
    </div>
  );
};

export default PreregisterBanner;
