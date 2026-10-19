import { useQuery, useQueryClient } from '@tanstack/react-query';
import { eachDayOfInterval, isValid, parseISO } from 'date-fns';
import {
  LEGACY_WALK_IN_CATEGORY_LABEL,
  normalizeExpoId,
  WALK_IN_CATEGORIES,
  WALK_IN_CATEGORY_LABEL,
} from '@/shared/config';
import { useRealtimeRefetchInterval } from '@/shared/libs/realtime/AdminRealtimeProvider';
import { EntrySummary } from '@/shared/types/exhibition/check-in/entry';
import { dateToString } from '../../common';
import { getAttendanceSummary } from '../api/getAttendanceSummary';

export const ATTENDANCE_REFRESH_MS = 10 * 1000;

// 날짜 탭에서 행사 전 기간을 고르는 값
export const ALL_DAYS = 'all';

export const attendanceSummaryQueryKey = (expoId: string, date: string) =>
  ['attendanceSummary', expoId, date] as const;

/** 날짜 탭 값을 서버 조회 조건으로. 전체 기록은 null(all=true) */
export const toPeriodDate = (day: string) => (day === ALL_DAYS ? null : day);

/** 박람회 시작일~종료일의 모든 날짜(YYYY-MM-DD) */
export const getExpoDays = (startedDay?: string, finishedDay?: string) => {
  if (!startedDay || !finishedDay) return [];
  const start = parseISO(startedDay);
  const end = parseISO(finishedDay);
  if (!isValid(start) || !isValid(end) || start > end) return [];
  return eachDayOfInterval({ start, end }).map(dateToString);
};

/** 오늘이 행사 기간이면 오늘, 아니면 첫날 */
export const getDefaultDay = (days: string[]) => {
  const today = dateToString(new Date());
  return days.includes(today) ? today : (days[0] ?? ALL_DAYS);
};

/** 고른 날짜(또는 전체 기록)의 입·퇴장 집계 */
export const useAttendanceSummary = (expoId: string, day: string) => {
  const queryClient = useQueryClient();
  const serverExpoId = normalizeExpoId(expoId);
  const queryKey = attendanceSummaryQueryKey(serverExpoId ?? expoId, day);

  const query = useQuery({
    queryKey,
    queryFn: () => getAttendanceSummary(serverExpoId!, toPeriodDate(day)),
    enabled: Boolean(serverExpoId),
    refetchInterval: useRealtimeRefetchInterval(
      ATTENDANCE_REFRESH_MS,
      'ATTENDANCE',
    ),
    // 실패는 화면 영역 안에만 표시한다
    meta: { silent: true },
  });

  return {
    data: query.data,
    isError: query.isError,
    isFetching: query.isFetching,
    updatedAt: query.dataUpdatedAt,
    refetch: () => queryClient.invalidateQueries({ queryKey }),
  };
};

const PAPER_CATEGORY_LABEL: Record<string, string> = {
  ADULT: '성인',
  CHILD: '어린이·학생',
  GENERAL: '구분 없음',
};

/** 입장 방식별 건수. 구분 없는 종이 QR 은 있을 때만 보여 준다 */
export const getEntryMethodCounts = (summary: EntrySummary) => {
  const paperEntered = (category: string) =>
    (summary.paper ?? [])
      .filter((paper) => (paper.category ?? 'GENERAL') === category)
      .reduce((sum, { entered }) => sum + entered, 0);
  const walkInCount = (category: string) =>
    summary.walkIn?.counts?.find((walkIn) => walkIn.category === category)
      ?.count ?? 0;
  const general = paperEntered('GENERAL');

  return [
    {
      label: '사전등록 QR · 일반',
      count: summary.registered?.standard ?? 0,
    },
    {
      label: '사전등록 QR · 연수',
      count: summary.registered?.trainee ?? 0,
    },
    ...['ADULT', 'CHILD'].map((category) => ({
      label: `현장 인쇄 QR · ${PAPER_CATEGORY_LABEL[category]}`,
      count: paperEntered(category),
    })),
    ...(general > 0
      ? [
          {
            label: `현장 인쇄 QR · ${PAPER_CATEGORY_LABEL.GENERAL}`,
            count: general,
          },
        ]
      : []),
    // 예전 구분(성인·어린이·학생)은 기록이 있을 때만 보여 준다
    ...[
      ...WALK_IN_CATEGORIES.map(({ value }) => value as string),
      ...Object.keys(LEGACY_WALK_IN_CATEGORY_LABEL).filter(walkInCount),
    ].map((category) => ({
      label: `간편입장 +1 · ${WALK_IN_CATEGORY_LABEL[category]}`,
      count: walkInCount(category),
    })),
  ];
};
