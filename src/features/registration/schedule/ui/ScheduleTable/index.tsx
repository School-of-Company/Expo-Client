'use client';

import { Trash } from '@/shared/assets/icons';
import {
  formatDateTimeValue,
  fromOffsetDateTime,
  PreregisterSession,
  RegistrationTable,
  ScheduleProgram,
  StatusBadge,
  TableColumn,
} from '../../../common';
import {
  formatDefinitionSchedule,
  PROGRAM_TYPE_LABEL,
} from '../../../common/model/ledger';
import { usePreregisterSummary } from '../../../common/model/preregisterSummary';
import {
  getProgramGroupId,
  getProgramGroups,
} from '../../model/programFormLink';

export type ScheduleKind = 'STANDARD' | 'TRAINING' | 'PRE';

export type ScheduleItem =
  | { id: string; kind: 'program'; program: ScheduleProgram }
  | {
      id: string;
      kind: 'session';
      session: PreregisterSession;
      needsRetry: boolean;
    };

export const toSessionItemId = (id: number) => `pre-${id}`;

interface ScheduleTableProps {
  expoId: string;
  items: ScheduleItem[];
  programs: ScheduleProgram[];
  isBusy: boolean;
  onEditProgram: (program: ScheduleProgram) => void;
  onDeleteProgram: (program: ScheduleProgram) => void;
  onEditSession: (session: PreregisterSession) => void;
  onDeleteSession: (session: PreregisterSession) => void;
  onRetrySession: (session: PreregisterSession) => void;
}

const formatPeriod = (program: ScheduleProgram) => {
  const start = fromOffsetDateTime(program.policy?.applicationStartedAt);
  const end = fromOffsetDateTime(program.policy?.applicationEndedAt);
  if (!start && !end) return '제한 없음';
  return `${start ? formatDateTimeValue(start) : ''} ~ ${end ? formatDateTimeValue(end) : ''}`;
};

const ScheduleTable = ({
  expoId,
  items,
  programs,
  isBusy,
  onEditProgram,
  onDeleteProgram,
  onEditSession,
  onDeleteSession,
  onRetrySession,
}: ScheduleTableProps) => {
  // 신청수는 Application 집계에서 읽는다. 실패하면 칸만 비워 둔다
  const { data: summary } = usePreregisterSummary(expoId);
  const summaryBySession = new Map(
    summary?.sessions.map((item) => [item.sessionId, item]),
  );
  const groupIds = getProgramGroups(programs).map(({ groupId }) => groupId);

  const columns: TableColumn<ScheduleItem>[] = [
    {
      key: 'kind',
      label: '구분',
      flex: 0.7,
      render: (item) => {
        if (item.kind === 'session')
          return <StatusBadge tone="outline">사전등록</StatusBadge>;
        const { programType, category } = item.program;
        const label = category
          ? `${PROGRAM_TYPE_LABEL[programType]} · ${category === 'ESSENTIAL' ? '필수' : '선택'}`
          : PROGRAM_TYPE_LABEL[programType];
        return (
          <StatusBadge tone={programType === 'TRAINING' ? 'main' : 'gray'}>
            {label}
          </StatusBadge>
        );
      },
    },
    {
      key: 'title',
      label: '이름',
      flex: 1.6,
      render: (item) => {
        if (item.kind === 'session')
          return <p className="truncate text-black">{item.session.title}</p>;
        const index = groupIds.indexOf(getProgramGroupId(item.program) ?? '');
        return (
          <>
            <p className="truncate text-black">{item.program.title}</p>
            {index >= 0 && (
              <p className="text-caption2r text-gray-400">묶음 {index + 1}</p>
            )}
          </>
        );
      },
    },
    {
      key: 'schedule',
      label: '일정',
      flex: 1.5,
      render: (item) =>
        item.kind === 'session'
          ? formatDefinitionSchedule(
              fromOffsetDateTime(item.session.startedAt) ?? '',
              fromOffsetDateTime(item.session.endedAt) ?? '',
            )
          : formatDefinitionSchedule(
              item.program.startedAt,
              item.program.endedAt,
            ),
    },
    {
      key: 'period',
      label: '모집 기간',
      flex: 1.5,
      render: (item) =>
        item.kind === 'program' && item.program.policy
          ? formatPeriod(item.program)
          : '-',
    },
    {
      key: 'capacity',
      label: '정원 / 대기',
      flex: 0.8,
      render: (item) => {
        if (item.kind === 'session') {
          const { capacity, waitingCapacity, id } = item.session;
          const applied = summaryBySession.get(id);
          return (
            <>
              <p>
                {capacity} / {waitingCapacity}
              </p>
              {applied && (
                <p className="text-caption2r">
                  확정 {applied.confirmedParticipants}
                  {applied.waitingParticipants > 0 &&
                    ` · 대기 ${applied.waitingParticipants}`}
                </p>
              )}
            </>
          );
        }
        const { policy } = item.program;
        if (!policy) return '-';
        return (
          <>
            <p>
              {policy.capacity ?? '-'} / {policy.waitingCapacity ?? 0}
            </p>
            <p className="text-caption2r">
              사전 {policy.preRegistrationCapacity ?? '-'} · 현장{' '}
              {policy.onsiteCapacity ?? '-'}
            </p>
          </>
        );
      },
    },
    {
      key: 'status',
      label: '상태',
      flex: 0.7,
      render: (item) => {
        if (item.kind === 'session') {
          if (item.needsRetry)
            return <StatusBadge tone="error">변경 처리 중</StatusBadge>;
          return item.session.closed ? (
            <StatusBadge>마감</StatusBadge>
          ) : (
            <StatusBadge tone="main">모집 중</StatusBadge>
          );
        }
        const { pendingRevision, policy } = item.program;
        if (pendingRevision !== null)
          return <StatusBadge tone="error">변경 처리 중</StatusBadge>;
        if (!policy) return <StatusBadge tone="outline">정책 없음</StatusBadge>;
        return policy.closed ? (
          <StatusBadge>마감</StatusBadge>
        ) : (
          <StatusBadge tone="main">모집 중</StatusBadge>
        );
      },
    },
    {
      key: 'actions',
      label: '관리',
      flex: 0.9,
      render: (item) => {
        const isSession = item.kind === 'session';
        const pending = isSession
          ? item.needsRetry
          : item.program.pendingRevision !== null;
        return (
          <div className="flex items-center justify-center gap-12">
            {isSession && item.needsRetry ? (
              <button
                type="button"
                className="text-body2r text-error disabled:opacity-40"
                disabled={isBusy}
                onClick={() => onRetrySession(item.session)}
              >
                다시 처리
              </button>
            ) : (
              <button
                type="button"
                className="text-body2r text-main-600 disabled:opacity-40"
                disabled={pending || isBusy}
                onClick={() =>
                  isSession
                    ? onEditSession(item.session)
                    : onEditProgram(item.program)
                }
              >
                수정
              </button>
            )}
            <button
              type="button"
              aria-label="회차 삭제"
              disabled={isBusy}
              onClick={() =>
                isSession
                  ? onDeleteSession(item.session)
                  : onDeleteProgram(item.program)
              }
              className="disabled:opacity-40"
            >
              <Trash />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <RegistrationTable
      columns={columns}
      rows={items}
      emptyText="등록된 회차가 없습니다."
      footerText="회차"
      footerCount={items.length}
      minWidth="1000px"
      maxHeight="none"
    />
  );
};

export default ScheduleTable;
