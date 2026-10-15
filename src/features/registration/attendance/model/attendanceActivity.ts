import { useQuery } from '@tanstack/react-query';
import { normalizeExpoId } from '@/shared/config';
import {
  EntryMethod,
  EntryRecord,
  getHourlyEntries,
  getRecentEntryRecords,
  getScannerEntryCounts,
  HourlyEntryBucket,
} from '../api/getAttendanceActivity';
import { ATTENDANCE_REFRESH_MS, toPeriodDate } from './attendanceSummary';

const METHOD_LABEL: Record<EntryMethod, string> = {
  REGISTERED_STANDARD: '사전등록 QR · 일반',
  REGISTERED_TRAINEE: '사전등록 QR · 연수',
  PAPER_QR: '현장 인쇄 QR',
  WALK_IN: '간편입장',
};

const CATEGORY_LABEL: Record<string, string> = {
  ADULT: '성인',
  CHILD: '어린이·학생',
  STUDENT: '어린이·학생',
  GENERAL: '구분 없음',
};

/** 입장 방식과 종이 QR·간편입장 구분을 한 줄로 */
export const getEntryMethodLabel = ({ method, category }: EntryRecord) => {
  const label = METHOD_LABEL[method] ?? method;
  return category
    ? `${label} · ${CATEGORY_LABEL[category] ?? category}`
    : label;
};

// 기록이 없어도 행사 운영 시간대는 그래프에 보이게 한다
const DEFAULT_HOURS = { from: 9, to: 18 };

/** 날짜별 시간 집계를 시간 하나로 더하고, 빈 시간은 0 으로 채운다 */
export const toHourlyPoints = (buckets: HourlyEntryBucket[]) => {
  const byHour = new Map<number, { entered: number; exited: number }>();
  buckets.forEach(({ hour, entered, exited }) => {
    const prev = byHour.get(hour) ?? { entered: 0, exited: 0 };
    byHour.set(hour, {
      entered: prev.entered + entered,
      exited: prev.exited + exited,
    });
  });
  const hours = Array.from(byHour.keys());
  const from = Math.min(DEFAULT_HOURS.from, ...hours);
  const to = Math.max(DEFAULT_HOURS.to, ...hours);
  return Array.from({ length: to - from + 1 }, (_, index) => {
    const hour = from + index;
    return { hour, ...(byHour.get(hour) ?? { entered: 0, exited: 0 }) };
  });
};

/** 시간대별 추이·최근 기록·스캐너별 건수. 집계와 같이 10초마다 갱신한다 */
export const useAttendanceActivity = (expoId: string, day: string) => {
  const serverExpoId = normalizeExpoId(expoId);
  const options = {
    enabled: Boolean(serverExpoId),
    refetchInterval: ATTENDANCE_REFRESH_MS,
    meta: { silent: true },
  };

  const hourly = useQuery({
    queryKey: ['attendanceHourly', serverExpoId, day],
    queryFn: () => getHourlyEntries(serverExpoId!, toPeriodDate(day)),
    select: toHourlyPoints,
    ...options,
  });
  const recent = useQuery({
    queryKey: ['attendanceRecent', serverExpoId, day],
    queryFn: () => getRecentEntryRecords(serverExpoId!, toPeriodDate(day)),
    ...options,
  });
  const scanners = useQuery({
    queryKey: ['attendanceScanners', serverExpoId, day],
    queryFn: () => getScannerEntryCounts(serverExpoId!, toPeriodDate(day)),
    ...options,
  });

  return { hourly, recent, scanners };
};
