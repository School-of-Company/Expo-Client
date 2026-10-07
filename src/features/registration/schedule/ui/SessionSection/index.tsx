'use client';

import { useState } from 'react';
import { Trash } from '@/shared/assets/icons';
import {
  RegistrationProgram,
  RegistrationSession,
} from '@/shared/types/registration/type';
import { AddItemButton, Input, ToggleButton } from '@/shared/ui';
import SelectDateInput from '@/shared/ui/SelectDateInput';
import SelectTimeInput from '@/shared/ui/SelectTimeInput';
import {
  DATE_PICKER_PORTAL_ID,
  dateFromString,
  dateToString,
  RegistrationTable,
  SessionStat,
  TableColumn,
  timeFromString,
  timeToString,
} from '../../../common';
import ScheduleSection from '../ScheduleSection';
import SessionCreateForm from '../SessionCreateForm';

interface SessionSectionProps {
  programs: RegistrationProgram[];
  sessions: RegistrationSession[];
  sessionStats: Map<number, SessionStat>;
  onChange: (id: number, patch: Partial<RegistrationSession>) => void;
  onDelete: (id: number) => void;
  isLocked: boolean;
}

const toCount = (value: string) => Math.max(Number(value) || 0, 0);

const SessionSection = ({
  programs,
  sessions,
  sessionStats,
  onChange,
  onDelete,
  isLocked,
}: SessionSectionProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const programById = new Map(programs.map((program) => [program.id, program]));
  const sortedSessions = [...sessions].sort((a, b) =>
    `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`),
  );

  const columns: TableColumn<RegistrationSession>[] = [
    {
      key: 'program',
      label: '프로그램',
      flex: 1.3,
      render: (session) => (
        <p className="truncate text-black">
          {programById.get(session.programId)?.name}
        </p>
      ),
    },
    {
      key: 'round',
      label: '회차',
      flex: 0.5,
      render: (session) => (
        <Input
          size="small"
          type="number"
          min={1}
          value={session.round}
          onChange={(e) =>
            onChange(session.id, { round: toCount(e.target.value) })
          }
        />
      ),
    },
    {
      key: 'name',
      label: '회차명',
      flex: 1.3,
      render: (session) => (
        <Input
          size="small"
          value={session.name}
          onChange={(e) => onChange(session.id, { name: e.target.value })}
        />
      ),
    },
    {
      key: 'date',
      label: '운영일',
      flex: 1.1,
      render: (session) => (
        <SelectDateInput
          value={dateFromString(session.date)}
          onChange={(date) =>
            date && onChange(session.id, { date: dateToString(date) })
          }
          inputClassName="h-[34px] px-8 text-body2r text-center"
          portalId={DATE_PICKER_PORTAL_ID}
        />
      ),
    },
    {
      key: 'time',
      label: '시작 / 종료',
      flex: 1.4,
      render: (session) => (
        <div className="flex gap-4">
          <SelectTimeInput
            value={timeFromString(session.startTime)}
            onChange={(time) =>
              time && onChange(session.id, { startTime: timeToString(time) })
            }
            portalId={DATE_PICKER_PORTAL_ID}
          />
          <SelectTimeInput
            value={timeFromString(session.endTime)}
            onChange={(time) =>
              time && onChange(session.id, { endTime: timeToString(time) })
            }
            portalId={DATE_PICKER_PORTAL_ID}
          />
        </div>
      ),
    },
    {
      key: 'place',
      label: '장소',
      render: (session) => (
        <Input
          size="small"
          value={session.place}
          onChange={(e) => onChange(session.id, { place: e.target.value })}
        />
      ),
    },
    {
      key: 'capacity',
      label: '정원',
      flex: 0.6,
      render: (session) => {
        const confirmed = sessionStats.get(session.id)?.confirmed ?? 0;
        return (
          <Input
            size="small"
            type="number"
            min={0}
            error={session.capacity < confirmed}
            value={session.capacity}
            onChange={(e) =>
              onChange(session.id, { capacity: toCount(e.target.value) })
            }
          />
        );
      },
    },
    {
      key: 'waitlistCapacity',
      label: '대기정원',
      flex: 0.6,
      render: (session) => (
        <Input
          size="small"
          type="number"
          min={0}
          value={session.waitlistCapacity}
          onChange={(e) =>
            onChange(session.id, { waitlistCapacity: toCount(e.target.value) })
          }
        />
      ),
    },
    {
      key: 'status',
      label: '확정 / 대기',
      flex: 0.8,
      render: (session) => {
        const stat = sessionStats.get(session.id);
        return (
          <p>
            <span className="text-main-600">{stat?.confirmed ?? 0}</span> /{' '}
            {stat?.waiting ?? 0}
          </p>
        );
      },
    },
    {
      key: 'promotion',
      label: '자동 승급',
      flex: 0.7,
      render: (session) => (
        <div className="flex justify-center">
          <ToggleButton
            value={session.promotionMode === 'AUTO'}
            onChange={(isAuto) =>
              onChange(session.id, {
                promotionMode: isAuto ? 'AUTO' : 'MANUAL',
              })
            }
          />
        </div>
      ),
    },
    {
      key: 'delete',
      label: '삭제',
      flex: 0.4,
      render: (session) => (
        <button
          type="button"
          aria-label="회차 삭제"
          disabled={isLocked}
          onClick={() => onDelete(session.id)}
          className="disabled:opacity-40"
        >
          <Trash />
        </button>
      ),
    },
  ];

  return (
    <ScheduleSection
      title="회차"
      description="실제 행사 시간 단위입니다. 정원을 늘리면 자동 승급 회차의 대기자가 순서대로 확정됩니다."
    >
      <RegistrationTable
        columns={columns}
        rows={sortedSessions}
        emptyText="등록된 회차가 없습니다."
        footerText="회차"
        footerCount={sessions.length}
        minWidth="1500px"
        maxHeight="none"
      >
        {isCreating ? (
          <SessionCreateForm
            programs={programs}
            sessions={sessions}
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
