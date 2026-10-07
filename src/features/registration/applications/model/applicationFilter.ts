import { ApplicationRow } from '../../common';

export type StatusFilter =
  | 'ACTIVE'
  | 'CONFIRMED'
  | 'WAITING'
  | 'CANCELED'
  | 'ALL';

export interface ApplicationFilter {
  keyword: string;
  programId: string;
  sessionId: string;
  status: StatusFilter;
  applyType: string;
  date: string;
}

export const INITIAL_FILTER: ApplicationFilter = {
  keyword: '',
  programId: '',
  sessionId: '',
  status: 'ACTIVE',
  applyType: '',
  date: '',
};

export const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'ACTIVE', label: '확정+대기' },
  { value: 'CONFIRMED', label: '확정' },
  { value: 'WAITING', label: '대기' },
  { value: 'CANCELED', label: '취소' },
  { value: 'ALL', label: '전체 상태' },
];

const matchesStatus = (row: ApplicationRow, status: StatusFilter) => {
  if (status === 'ALL') return true;
  if (status === 'ACTIVE') return row.status !== 'CANCELED';
  return row.status === status;
};

export const filterApplications = (
  rows: ApplicationRow[],
  filter: ApplicationFilter,
) => {
  const keyword = filter.keyword.trim().toLowerCase();
  const phoneKeyword = keyword.replace(/-/g, '');

  return rows.filter((row) => {
    if (filter.programId && String(row.programId) !== filter.programId)
      return false;
    if (filter.sessionId && String(row.sessionId) !== filter.sessionId)
      return false;
    if (filter.applyType && row.applyType !== filter.applyType) return false;
    if (filter.date && row.session.date !== filter.date) return false;
    if (!matchesStatus(row, filter.status)) return false;
    if (!keyword) return true;

    return (
      row.name.toLowerCase().includes(keyword) ||
      row.affiliation.toLowerCase().includes(keyword) ||
      (phoneKeyword.length > 0 &&
        row.contactNumber.replace(/-/g, '').includes(phoneKeyword))
    );
  });
};

export type SortKey = 'id' | 'name' | 'program' | 'schedule' | 'status';
export interface SortState {
  key: SortKey;
  direction: 'asc' | 'desc';
}

const STATUS_ORDER = { CONFIRMED: 0, WAITING: 1, CANCELED: 2 };

const compareBy: Record<
  SortKey,
  (a: ApplicationRow, b: ApplicationRow) => number
> = {
  id: (a, b) => a.id - b.id,
  name: (a, b) => a.name.localeCompare(b.name, 'ko'),
  program: (a, b) => a.program.name.localeCompare(b.program.name, 'ko'),
  schedule: (a, b) =>
    `${a.session.date} ${a.session.startTime}`.localeCompare(
      `${b.session.date} ${b.session.startTime}`,
    ),
  status: (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status],
};

export const sortApplications = (rows: ApplicationRow[], sort: SortState) => {
  const sign = sort.direction === 'asc' ? 1 : -1;
  return [...rows].sort(
    (a, b) => sign * compareBy[sort.key](a, b) || b.id - a.id,
  );
};
