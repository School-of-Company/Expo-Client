'use client';

import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import {
  RegistrationTable,
  TableColumn,
  useRegistrationExpo,
} from '../../../common';
import {
  AdminSessionSummary,
  ProgramSessionDefinition,
  ProgramSessionPolicy,
  ProgramSessionType,
} from '../../../common/api/ledgerApi';
import {
  formatDefinitionSchedule,
  PROGRAM_TYPE_LABEL,
  toSessionKey,
} from '../../../common/model/ledger';

interface SessionStatusRow {
  id: string;
  programType: ProgramSessionType;
  title: string;
  startedAt: string | null;
  endedAt: string | null;
  policy: ProgramSessionPolicy | null;
  summary: AdminSessionSummary | null;
  /** 집계 조회가 실패한 상태. 0건과 구분해 '-' 로 보인다 */
  isSummaryUnavailable: boolean;
}

/** 집계 조회가 실패했으면 '-', 회차에 접수가 없으면 0 */
const count = (
  { summary, isSummaryUnavailable }: SessionStatusRow,
  pick: (summary: AdminSessionSummary) => number | undefined,
) => (isSummaryUnavailable ? '-' : ((summary && pick(summary)) ?? 0));

const COLUMNS: TableColumn<SessionStatusRow>[] = [
  {
    key: 'session',
    label: '회차',
    flex: 2.4,
    render: (row) => (
      <>
        <p className="truncate text-black">{row.title}</p>
        <p className="text-caption2r">
          {PROGRAM_TYPE_LABEL[row.programType]} ·{' '}
          {formatDefinitionSchedule(row.startedAt, row.endedAt)}
        </p>
      </>
    ),
  },
  {
    key: 'capacity',
    label: '정원',
    render: ({ policy, startedAt }) =>
      policy ? (
        <>
          <p>{policy.capacity}</p>
          {policy.preRegistrationCapacity != null && (
            <p className="text-caption2r">
              사전 {policy.preRegistrationCapacity} · 현장{' '}
              {policy.onsiteCapacity ?? 0}
            </p>
          )}
          <p className="text-caption2r">
            대기 {policy.waitingCapacity}
            {policy.closed && ' · 마감'}
          </p>
        </>
      ) : startedAt !== null ? (
        // 현재 회차인데 정책이 없다. 정원 0·마감으로 보이지 않게 구분한다
        <span className="text-caption1r text-gray-500">모집 설정 필요</span>
      ) : (
        '-'
      ),
  },
  {
    key: 'confirmed',
    label: '확정',
    flex: 0.7,
    render: (row) => (
      <span className="text-main-600">
        {count(row, (s) => s.statusCounts.CONFIRMED)}
      </span>
    ),
  },
  {
    key: 'waiting',
    label: '대기',
    flex: 0.7,
    render: (row) => count(row, (s) => s.statusCounts.WAITING),
  },
  {
    key: 'cancelled',
    label: '취소',
    flex: 0.7,
    render: (row) => count(row, (s) => s.statusCounts.CANCELLED),
  },
  {
    key: 'participants',
    label: '고유 참가자',
    flex: 0.9,
    render: (row) => count(row, (s) => s.uniqueParticipants),
  },
  {
    key: 'attendance',
    label: '출석 (회차 전체)',
    render: ({ summary }) => {
      const attendance = summary?.attendance;
      if (!attendance) return '-';
      return (
        <>
          <p>{attendance.attendeeCount}</p>
          {attendance.firstEntryTime && (
            <p className="text-caption2r">
              {attendance.firstEntryTime} ~ {attendance.lastEntryTime}
            </p>
          )}
        </>
      );
    },
  },
];

interface SessionStatusTableProps {
  sessions: ProgramSessionDefinition[];
  /** null 이면 집계 조회 실패 */
  summaries: AdminSessionSummary[] | null;
}

/** 현재 회차(정원)와 회차별 신청·출석 집계를 합친다. 삭제된 과거 회차는 현재 회차 API 에 없으므로 원장 이력 집계로만 남긴다 */
const SessionStatusTable = ({
  sessions,
  summaries,
}: SessionStatusTableProps) => {
  const router = useRouter();
  const { routes } = useRegistrationExpo();

  const rows = useMemo(() => {
    const isSummaryUnavailable = summaries === null;
    const list = summaries ?? [];
    const summaryByKey = new Map(
      list.map((summary) => [
        toSessionKey({
          programType: summary.programType,
          id: summary.programId,
        }),
        summary,
      ]),
    );
    const current: SessionStatusRow[] = sessions.map((session) => {
      const key = toSessionKey(session);
      return {
        id: key,
        programType: session.programType,
        title: session.title,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        policy: session.policy ?? null,
        summary: summaryByKey.get(key) ?? null,
        isSummaryUnavailable,
      };
    });
    const currentKeys = new Set(current.map(({ id }) => id));
    const removed: SessionStatusRow[] = list
      .filter(
        ({ programType, programId }) =>
          !currentKeys.has(toSessionKey({ programType, id: programId })),
      )
      .map((summary) => ({
        id: toSessionKey({
          programType: summary.programType,
          id: summary.programId,
        }),
        programType: summary.programType,
        title: `회차 ${summary.programId} (삭제된 회차 · 원장 이력)`,
        startedAt: null,
        endedAt: null,
        policy: null,
        summary,
        isSummaryUnavailable,
      }));
    return [...current, ...removed].sort((a, b) =>
      (a.startedAt ?? '9').localeCompare(b.startedAt ?? '9'),
    );
  }, [sessions, summaries]);

  return (
    <>
      <p className="mb-8 text-caption1r text-gray-400">
        출석은 접수 상태·필터와 무관하게 회차에 실제 입실한 전체 인원이며,
        시간은 입실 범위(HH:mm)입니다. 확정·대기·취소는 신청 건수입니다.
      </p>
      <RegistrationTable
        columns={COLUMNS}
        rows={rows}
        emptyText="등록된 회차가 없습니다."
        footerText="회차"
        footerCount={rows.length}
        maxHeight="420px"
        minWidth="900px"
        onRowClick={({ id }) =>
          router.push(
            `${routes.applications}?session=${encodeURIComponent(id)}`,
          )
        }
      />
    </>
  );
};

export default SessionStatusTable;
