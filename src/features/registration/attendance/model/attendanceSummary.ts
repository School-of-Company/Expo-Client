import { useQueries, useQueryClient } from '@tanstack/react-query';
import { eachDayOfInterval, isValid, parseISO } from 'date-fns';
import { normalizeExpoId } from '@/shared/config';
import { EntrySummary } from '@/shared/types/exhibition/check-in/entry';
import { dateToString } from '../../common';
import { getAttendanceSummary } from '../api/getAttendanceSummary';

export const ATTENDANCE_REFRESH_MS = 10 * 1000;

// 날짜 탭에서 행사 전 기간을 고르는 값
export const ALL_DAYS = 'all';

export const attendanceSummaryQueryKey = (expoId: string, date: string) =>
  ['attendanceSummary', expoId, date] as const;

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

// 응답에 필드가 빠져 와도 0 으로 센다
const sumSummaries = (summaries: EntrySummary[]): EntrySummary => {
  const paper = new Map<string | null, { entered: number; exited: number }>();
  const walkIn = { ADULT: 0, STUDENT: 0 };
  summaries.forEach((summary) => {
    (summary.paper ?? []).forEach(({ category, entered, exited }) => {
      const prev = paper.get(category) ?? { entered: 0, exited: 0 };
      paper.set(category, {
        entered: prev.entered + entered,
        exited: prev.exited + exited,
      });
    });
    (summary.walkIn?.counts ?? []).forEach(({ category, count }) => {
      walkIn[category] = (walkIn[category] ?? 0) + count;
    });
  });
  const sum = (pick: (summary: EntrySummary) => number | undefined) =>
    summaries.reduce((total, summary) => total + (pick(summary) ?? 0), 0);

  return {
    expoId: summaries[0]?.expoId ?? '',
    date: ALL_DAYS,
    // 지역 일시 문자열이라 사전순이 곧 시간순이다
    generatedAt: summaries.reduce(
      (latest, { generatedAt }) =>
        (generatedAt ?? '') > latest ? generatedAt : latest,
      '',
    ),
    registered: {
      standard: sum((s) => s.registered?.standard),
      trainee: sum((s) => s.registered?.trainee),
    },
    paper: Array.from(paper, ([category, counts]) => ({
      category,
      ...counts,
    })),
    walkIn: {
      expoId: summaries[0]?.expoId ?? '',
      date: ALL_DAYS,
      counts: [
        { category: 'ADULT', count: walkIn.ADULT },
        { category: 'STUDENT', count: walkIn.STUDENT },
      ],
      total: walkIn.ADULT + walkIn.STUDENT,
    },
    totals: {
      entered: sum((s) => s.totals?.entered),
      exited: sum((s) => s.totals?.exited),
      stillInside: sum((s) => s.totals?.stillInside),
    },
  };
};

/**
 * 고른 날짜의 입·퇴장 집계. 전체 기록은 서버 API 가 없어 날짜별로 따로 읽어 더한다.
 * 같은 날짜는 같은 쿼리 키라 탭을 오가도 다시 읽지 않는다
 */
export const useAttendanceSummary = (
  expoId: string,
  day: string,
  days: string[],
) => {
  const queryClient = useQueryClient();
  const serverExpoId = normalizeExpoId(expoId);
  const targetDays = day === ALL_DAYS ? days : [day];

  const queries = useQueries({
    queries: targetDays.map((date) => ({
      queryKey: attendanceSummaryQueryKey(serverExpoId ?? expoId, date),
      queryFn: () => getAttendanceSummary(serverExpoId!, date),
      enabled: Boolean(serverExpoId),
      refetchInterval: ATTENDANCE_REFRESH_MS,
      // 실패는 화면 영역 안에만 표시한다
      meta: { silent: true },
    })),
  });

  const results = queries.flatMap(({ data }) => (data ? [data] : []));
  const isComplete = results.length === targetDays.length && results.length > 0;
  const data = isComplete
    ? day === ALL_DAYS
      ? sumSummaries(results)
      : results[0]
    : undefined;

  return {
    data,
    isLoading: queries.some(({ isLoading }) => isLoading),
    isError: queries.some(({ isError }) => isError),
    isFetching: queries.some(({ isFetching }) => isFetching),
    updatedAt: isComplete
      ? Math.min(...queries.map(({ dataUpdatedAt }) => dataUpdatedAt))
      : 0,
    refetch: () =>
      Promise.all(
        targetDays.map((date) =>
          queryClient.invalidateQueries({
            queryKey: attendanceSummaryQueryKey(serverExpoId ?? expoId, date),
          }),
        ),
      ),
  };
};

const PAPER_CATEGORY_LABEL: Record<string, string> = {
  ADULT: '성인',
  CHILD: '어린이·학생',
  GENERAL: '구분 없음',
};

const WALK_IN_CATEGORY_LABEL: Record<string, string> = {
  ADULT: '성인',
  STUDENT: '어린이·학생',
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
    ...['ADULT', 'STUDENT'].map((category) => ({
      label: `간편입장 +1 · ${WALK_IN_CATEGORY_LABEL[category]}`,
      count: walkInCount(category),
    })),
  ];
};

/** 사전등록 QR 과 인쇄 QR 입장 수. 간편입장은 식별할 QR 이 없어 뺀다 */
export const getIdentifiedEntered = (summary: EntrySummary) =>
  (summary.registered?.standard ?? 0) +
  (summary.registered?.trainee ?? 0) +
  (summary.paper ?? []).reduce((sum, { entered }) => sum + entered, 0);
