'use client';

import { useState } from 'react';
import { Trash } from '@/shared/assets/icons';
import { AddItemButton, Input, ToggleButton } from '@/shared/ui';
import {
  DateTimeInput,
  PreregisterSession,
  RegistrationTable,
  TableColumn,
} from '../../../common';
import { SessionForm, toCount } from '../../model/sessionForm';
import ScheduleSection from '../ScheduleSection';
import SessionCreateForm from '../SessionCreateForm';

export interface SessionRow {
  id: number;
  session: PreregisterSession;
  form: SessionForm;
  /** 저장이 중단돼 서버의 재시도가 필요한 회차 */
  needsRetry: boolean;
}

interface SessionSectionProps {
  expoId: string;
  rows: SessionRow[];
  onChange: (id: number, patch: Partial<SessionForm>) => void;
  onDelete: (session: PreregisterSession) => void;
  onRetry: (session: PreregisterSession) => void;
  isLocked: boolean;
}

const SessionSection = ({
  expoId,
  rows,
  onChange,
  onDelete,
  onRetry,
  isLocked,
}: SessionSectionProps) => {
  const [isCreating, setIsCreating] = useState(false);

  const columns: TableColumn<SessionRow>[] = [
    {
      key: 'title',
      label: '회차명',
      flex: 1.2,
      render: ({ id, form }) => (
        <Input
          size="small"
          value={form.title}
          onChange={(e) => onChange(id, { title: e.target.value })}
        />
      ),
    },
    {
      key: 'startedAt',
      label: '시작',
      flex: 1.6,
      render: ({ id, form }) => (
        <DateTimeInput
          size="small"
          value={form.startedAt}
          onChange={(startedAt) => onChange(id, { startedAt })}
        />
      ),
    },
    {
      key: 'endedAt',
      label: '종료',
      flex: 1.6,
      render: ({ id, form }) => (
        <DateTimeInput
          size="small"
          value={form.endedAt}
          onChange={(endedAt) => onChange(id, { endedAt })}
        />
      ),
    },
    {
      key: 'place',
      label: '장소',
      render: ({ id, form }) => (
        <Input
          size="small"
          value={form.place}
          onChange={(e) => onChange(id, { place: e.target.value })}
        />
      ),
    },
    {
      key: 'capacity',
      label: '정원',
      flex: 0.5,
      render: ({ id, form }) => (
        <Input
          size="small"
          type="number"
          min={1}
          error={form.capacity < 1}
          value={form.capacity}
          onChange={(e) => onChange(id, { capacity: toCount(e.target.value) })}
        />
      ),
    },
    {
      key: 'waitingCapacity',
      label: '대기정원',
      flex: 0.5,
      render: ({ id, form }) => (
        <Input
          size="small"
          type="number"
          min={0}
          value={form.waitingCapacity}
          onChange={(e) =>
            onChange(id, { waitingCapacity: toCount(e.target.value) })
          }
        />
      ),
    },
    {
      key: 'cancelEndedAt',
      label: '취소 마감',
      flex: 1.6,
      render: ({ id, form }) => (
        <DateTimeInput
          size="small"
          value={form.cancelEndedAt}
          onChange={(cancelEndedAt) => onChange(id, { cancelEndedAt })}
        />
      ),
    },
    {
      key: 'closed',
      label: '마감',
      flex: 0.5,
      render: ({ id, form }) => (
        <div className="flex justify-center">
          <ToggleButton
            value={form.closed}
            onChange={(closed) => onChange(id, { closed })}
          />
        </div>
      ),
    },
    {
      key: 'actions',
      label: '관리',
      flex: 0.6,
      render: ({ session, needsRetry }) =>
        needsRetry ? (
          <button
            type="button"
            className="text-body2r text-red-500 disabled:opacity-40"
            disabled={isLocked}
            onClick={() => onRetry(session)}
          >
            다시 처리
          </button>
        ) : (
          <button
            type="button"
            aria-label="회차 삭제"
            disabled={isLocked}
            onClick={() => onDelete(session)}
            className="disabled:opacity-40"
          >
            <Trash />
          </button>
        ),
    },
  ];

  return (
    <ScheduleSection
      title="사전등록 회차"
      description="박람회 입장 사전등록을 받는 시간대입니다. 신청 이력이 있는 회차는 마감·재개만 바꿀 수 있고 삭제할 수 없습니다. 취소 마감을 비우면 참가자가 취소할 수 없습니다."
    >
      <RegistrationTable
        columns={columns}
        rows={rows}
        emptyText="등록된 사전등록 회차가 없습니다."
        footerText="회차"
        footerCount={rows.length}
        minWidth="1700px"
        maxHeight="none"
      >
        {isCreating ? (
          <SessionCreateForm
            expoId={expoId}
            onClose={() => setIsCreating(false)}
          />
        ) : (
          !isLocked && <AddItemButton onClick={() => setIsCreating(true)} />
        )}
      </RegistrationTable>
    </ScheduleSection>
  );
};

export default SessionSection;
