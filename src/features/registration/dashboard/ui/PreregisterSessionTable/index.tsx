'use client';

import { useMemo } from 'react';
import { toKstLocal } from '@/shared/libs/kstDateTime';
import {
  PreregisterSession,
  RegistrationTable,
  TableColumn,
} from '../../../common';
import { AdminPreregisterSessionSummary } from '../../../common/api/preregisterSummaryApi';
import { formatDefinitionSchedule } from '../../../common/model/ledger';
import {
  formatPromotionBlockedReason,
  useAdoptWaitingCapacity,
} from '../../../common/model/preregisterSummary';

interface PreregisterSessionRow {
  id: number;
  label: string;
  /** Expo 회차를 찾지 못하면 null */
  session: PreregisterSession | null;
  summary: AdminPreregisterSessionSummary;
}

interface PreregisterSessionTableProps {
  expoId: string;
  summaries: AdminPreregisterSessionSummary[];
  /** Expo 회차 목록. 불러오지 못하면 회차 번호로 표시하고 대기 정원 적용을 막는다 */
  sessions: PreregisterSession[] | undefined;
}

const formatWaitingCapacity = (value: number) =>
  value === 0 ? '0명(대기 미사용)' : `${value}명`;

/** 사전등록 회차별 확정·취소·대기와 Application 대기 정원 적용 상태 */
const PreregisterSessionTable = ({
  expoId,
  summaries,
  sessions,
}: PreregisterSessionTableProps) => {
  const { mutate: adopt, isPending } = useAdoptWaitingCapacity(expoId);

  const rows = useMemo<PreregisterSessionRow[]>(() => {
    const sessionById = new Map(
      (sessions ?? []).map((session) => [session.id, session]),
    );
    return summaries
      .map((summary) => {
        const session = sessionById.get(summary.sessionId) ?? null;
        return {
          id: summary.sessionId,
          label: session?.title ?? `회차 #${summary.sessionId}`,
          session,
          summary,
        };
      })
      .sort(
        (a, b) =>
          (a.session?.startedAt ?? '9').localeCompare(
            b.session?.startedAt ?? '9',
          ) || a.id - b.id,
      );
  }, [sessions, summaries]);

  const handleAdopt = ({ id, label, session }: PreregisterSessionRow) => {
    if (!session) return;
    const expected = session.waitingCapacity;
    if (
      !window.confirm(
        `'${label}' 회차에 현재 대기 정원 ${formatWaitingCapacity(expected)}을 적용할까요?\n적용하면 이 정원 기준으로 대기 신청과 승급이 동작합니다.`,
      )
    )
      return;
    adopt({ sessionId: id, expected });
  };

  const columns: TableColumn<PreregisterSessionRow>[] = [
    {
      key: 'session',
      label: '회차',
      flex: 2.2,
      render: ({ label, session }) => (
        <>
          <p className="truncate text-black">{label}</p>
          {session && (
            <p className="text-caption2r">
              {formatDefinitionSchedule(
                toKstLocal(session.startedAt),
                toKstLocal(session.endedAt),
              )}
            </p>
          )}
        </>
      ),
    },
    {
      key: 'confirmed',
      label: '확정',
      flex: 0.7,
      render: ({ summary }) => (
        <span className="text-main-600">{summary.confirmedParticipants}</span>
      ),
    },
    {
      key: 'cancelled',
      label: '취소',
      flex: 0.7,
      render: ({ summary }) => summary.cancelledParticipants,
    },
    {
      key: 'waiting',
      label: '대기',
      flex: 0.8,
      render: ({ summary }) => (
        <>
          <p>{summary.waitingParticipants}명</p>
          <p className="text-caption2r">일행 {summary.waitingReservations}</p>
        </>
      ),
    },
    {
      key: 'pending',
      label: '확정 전 예약',
      flex: 0.9,
      render: ({ summary }) => (
        <>
          <p>{summary.pendingReservations}건</p>
          <p className="text-caption2r">{summary.pendingApplicants}명</p>
        </>
      ),
    },
    {
      key: 'freeSeats',
      label: '빈 확정석',
      flex: 0.8,
      render: ({ summary }) => summary.freeConfirmedSeats ?? '-',
    },
    {
      key: 'waitingCapacity',
      label: '대기 정원',
      flex: 1.3,
      render: (row) => {
        const { summary, session } = row;
        if (summary.appliedWaitingCapacity !== null) {
          return (
            <>
              <p>{summary.appliedWaitingCapacity}</p>
              <p className="text-caption2r">적용됨</p>
            </>
          );
        }
        return (
          <>
            <p className="text-red-500">미적용</p>
            <button
              type="button"
              className="text-caption2r text-main-600 disabled:opacity-40"
              disabled={!session || isPending}
              onClick={() => handleAdopt(row)}
            >
              대기 정원 적용
              {session && ` (${session.waitingCapacity})`}
            </button>
            {!session && (
              <p className="break-keep text-caption2r">
                Expo 회차 대기 정원을 확인할 수 없어 적용할 수 없습니다.
              </p>
            )}
          </>
        );
      },
    },
    {
      key: 'blocked',
      label: '승급 멈춤',
      flex: 2,
      render: ({ summary }) => {
        const reason = formatPromotionBlockedReason(summary);
        return reason ? (
          <p className="break-keep text-caption1r text-red-500">{reason}</p>
        ) : (
          '-'
        );
      },
    },
  ];

  return (
    <RegistrationTable
      columns={columns}
      rows={rows}
      emptyText="사전등록 회차가 없습니다."
      footerText="회차"
      footerCount={rows.length}
      maxHeight="420px"
      minWidth="1000px"
    />
  );
};

export default PreregisterSessionTable;
