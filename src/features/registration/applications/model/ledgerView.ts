import { eachDayOfInterval, format, parseISO } from 'date-fns';
import { StatusBadgeTone } from '../../common';
import {
  AdminApplicationRow,
  AdminApplicationStatus,
  AdminSessionSummary,
  ProgramSessionDefinition,
} from '../../common/api/ledgerApi';
import { LedgerRow, toSessionKey } from '../../common/model/ledger';
import { getLedgerRowExtras, LedgerRowExtras } from '../mock/ledgerExtras';

export type ApplicationType = 'PRE' | 'FIELD';

export const APPLICATION_TYPE_LABEL: Record<ApplicationType, string> = {
  PRE: '사전신청',
  FIELD: '현장신청',
};

export const APPLICATION_TYPE_TONE: Record<ApplicationType, StatusBadgeTone> = {
  PRE: 'main',
  FIELD: 'outline',
};

export const LEDGER_STATUS_TONE: Record<
  AdminApplicationStatus,
  StatusBadgeTone
> = {
  CONFIRMED: 'main',
  WAITING: 'outline',
  CANCELLED: 'gray',
};

export interface SessionCapacity {
  confirmed: number;
  capacity: number;
}

/** 표에 그리는 행. 신청구분은 응답의 참가자 값, 접수번호·학교는 예시 값이다 */
export interface LedgerViewRow extends LedgerRow, LedgerRowExtras {
  applicationType: ApplicationType | null;
  capacity: SessionCapacity | null;
}

const toApplicationType = (value: string | null): ApplicationType | null =>
  value === 'PRE' || value === 'FIELD' ? value : null;

/** 현재 회차 정원과 회차별 확정 집계를 `${programType}:${programId}` 로 묶는다 */
export const buildCapacityMap = (
  sessions: ProgramSessionDefinition[],
  summaries: AdminSessionSummary[],
) => {
  const confirmed = new Map(
    summaries.map((summary) => [
      `${summary.programType}:${summary.programId}`,
      summary.statusCounts.CONFIRMED ?? 0,
    ]),
  );
  const map = new Map<string, SessionCapacity>();
  sessions.forEach((session) => {
    if (!session.policy) return;
    const key = toSessionKey(session);
    map.set(key, {
      confirmed: confirmed.get(key) ?? 0,
      capacity: session.policy.capacity,
    });
  });
  return map;
};

export const toLedgerViewRows = (
  rows: LedgerRow[],
  items: AdminApplicationRow[],
  capacityMap: Map<string, SessionCapacity>,
): LedgerViewRow[] => {
  const types = new Map(
    items.map((item) => [item.applicationId, item.participant.applicationType]),
  );
  return rows.map((row) => ({
    ...row,
    ...getLedgerRowExtras(row),
    applicationType: toApplicationType(types.get(row.id) ?? null),
    capacity:
      capacityMap.get(
        toSessionKey({ programType: row.programType, id: row.programId }),
      ) ?? null,
  }));
};

/** 서버 필터가 없어(Expo-Application-Server#107) 현재 페이지 행에만 거는 필터 */
export interface LedgerClientFilter {
  applicationType: ApplicationType | '';
  /** YYYY-MM-DD */
  eventDay: string;
}

export const INITIAL_CLIENT_FILTER: LedgerClientFilter = {
  applicationType: '',
  eventDay: '',
};

export const isClientFilterActive = (filter: LedgerClientFilter) =>
  filter.applicationType !== '' || filter.eventDay !== '';

export const matchesClientFilter = (
  row: LedgerViewRow,
  filter: LedgerClientFilter,
) =>
  (!filter.applicationType || row.applicationType === filter.applicationType) &&
  (!filter.eventDay || row.startedAt?.slice(0, 10) === filter.eventDay);

// 잘못된 기간으로 선택지가 끝없이 늘지 않게 막는다
const EXPO_DAY_MAX = 31;

/** 박람회 기간의 날짜 (YYYY-MM-DD) */
export const getExpoDays = (startedDay?: string, finishedDay?: string) => {
  if (!startedDay || !finishedDay) return [];
  try {
    return eachDayOfInterval({
      start: parseISO(startedDay),
      end: parseISO(finishedDay),
    })
      .slice(0, EXPO_DAY_MAX)
      .map((day) => format(day, 'yyyy-MM-dd'));
  } catch {
    return [];
  }
};
