'use client';

import { useState } from 'react';
import { Trash } from '@/shared/assets/icons';
import { AddItemButton, Input, ToggleButton } from '@/shared/ui';
import {
  DateTimeInput,
  formatDateWithWeekday,
  PreregisterSession,
  RegistrationTable,
  splitDateTime,
  TableColumn,
} from '../../../common';
import { usePreregisterSummary } from '../../../common/model/preregisterSummary';
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

/** 왼쪽 메뉴에서 개설 양식을 열 때 스크롤할 대상 */
export const SESSION_FORM_ID = 'schedule-session-form';

interface SessionSectionProps {
  expoId: string;
  rows: SessionRow[];
  onChange: (id: number, patch: Partial<SessionForm>) => void;
  onDelete: (session: PreregisterSession) => void;
  onRetry: (session: PreregisterSession) => void;
  isLocked: boolean;
  /** 넘기면 개설 양식을 밖에서 연다. 없으면 표 안에서 관리한다 */
  isCreating?: boolean;
  onCreatingChange?: (isCreating: boolean) => void;
}

const formatOperatingDay = (startedAt: string | null) => {
  const { date } = splitDateTime(startedAt);
  return date ? formatDateWithWeekday(date) : '-';
};

const SessionSection = ({
  expoId,
  rows,
  onChange,
  onDelete,
  onRetry,
  isLocked,
  isCreating: controlledCreating,
  onCreatingChange,
}: SessionSectionProps) => {
  const [ownCreating, setOwnCreating] = useState(false);
  const isCreating = controlledCreating ?? ownCreating;
  const setIsCreating = onCreatingChange ?? setOwnCreating;
  // 신청수는 Application 집계에서 읽는다. 실패하면 칸만 비워 두고 회차 편집은 계속한다
  const { data: summary } = usePreregisterSummary(expoId);
  const summaryBySession = new Map(
    summary?.sessions.map((item) => [item.sessionId, item]),
  );

  const columns: TableColumn<SessionRow>[] = [
    {
      key: 'id',
      label: 'ID',
      flex: 0.4,
      render: ({ id }) => id,
    },
    {
      key: 'operatingDay',
      label: '운영일',
      flex: 0.7,
      render: ({ form }) => (
        <p className="text-black">{formatOperatingDay(form.startedAt)}</p>
      ),
    },
    {
      key: 'title',
      label: '사전등록 회차명',
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
      key: 'applied',
      label: '신청수',
      flex: 0.7,
      render: ({ id }) => {
        const item = summaryBySession.get(id);
        if (!item) return '-';
        return (
          <div>
            <p className="text-black">확정 {item.confirmedParticipants}</p>
            {item.waitingParticipants > 0 && (
              <p className="text-caption2r">대기 {item.waitingParticipants}</p>
            )}
          </div>
        );
      },
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
      title="② 행사 입장 사전등록 회차"
      description="박람회 입장 사전등록을 받는 시간대입니다. 프로그램 신청 회차와 따로 운영되며 프로그램 폼을 연결하지 않습니다. 신청 이력이 있는 회차는 마감·재개만 바꿀 수 있고 삭제할 수 없습니다. 취소 마감을 비우면 참가자가 취소할 수 없습니다."
    >
      <p className="text-caption1r text-gray-500">
        신청수는 확정 인원이며 대기 인원을 함께 표시합니다.
      </p>
      <RegistrationTable
        columns={columns}
        rows={rows}
        emptyText="등록된 사전등록 회차가 없습니다."
        footerText="사전등록 회차"
        footerCount={rows.length}
        minWidth="2100px"
        maxHeight="none"
      >
        {isCreating ? (
          <div id={SESSION_FORM_ID} className="scroll-mt-[96px]">
            <SessionCreateForm
              expoId={expoId}
              onClose={() => setIsCreating(false)}
            />
          </div>
        ) : (
          !isLocked && <AddItemButton onClick={() => setIsCreating(true)} />
        )}
      </RegistrationTable>
    </ScheduleSection>
  );
};

export default SessionSection;
