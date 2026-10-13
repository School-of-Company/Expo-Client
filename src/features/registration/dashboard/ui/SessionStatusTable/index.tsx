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
}

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
    render: ({ policy }) =>
      policy ? (
        <>
          <p>{policy.capacity}</p>
          <p className="text-caption2r">
            대기 {policy.waitingCapacity}
            {policy.closed && ' · 마감'}
          </p>
        </>
      ) : (
        '-'
      ),
  },
  {
    key: 'confirmed',
    label: '확정',
    flex: 0.7,
    render: ({ summary }) => (
      <span className="text-main-600">
        {summary?.statusCounts.CONFIRMED ?? 0}
      </span>
    ),
  },
  {
    key: 'waiting',
    label: '대기',
    flex: 0.7,
    render: ({ summary }) => summary?.statusCounts.WAITING ?? 0,
  },
  {
    key: 'cancelled',
    label: '취소',
    flex: 0.7,
    render: ({ summary }) => summary?.statusCounts.CANCELLED ?? 0,
  },
  {
    key: 'participants',
    label: '고유 참가자',
    flex: 0.9,
    render: ({ summary }) => summary?.uniqueParticipants ?? 0,
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
  summaries: AdminSessionSummary[];
}

/** 현재 회차(정원)와 회차별 신청·출석 집계를 합친다. 삭제된 과거 회차도 집계가 있으면 남긴다 */
const SessionStatusTable = ({
  sessions,
  summaries,
}: SessionStatusTableProps) => {
  const router = useRouter();
  const { routes } = useRegistrationExpo();

  const rows = useMemo(() => {
    const summaryByKey = new Map(
      summaries.map((summary) => [
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
      };
    });
    const currentKeys = new Set(current.map(({ id }) => id));
    const removed: SessionStatusRow[] = summaries
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
        title: `회차 ${summary.programId} (현재 회차에 없음)`,
        startedAt: null,
        endedAt: null,
        policy: null,
        summary,
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
        maxHeight="none"
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
