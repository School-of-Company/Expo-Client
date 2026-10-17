'use client';

import { useState } from 'react';
import { retryProgramChanges } from '@/shared/api';
import { Trash } from '@/shared/assets/icons';
import { AddItemButton, Button } from '@/shared/ui';
import {
  deleteScheduleProgram,
  formatDateTimeValue,
  fromOffsetDateTime,
  RegistrationTable,
  ScheduleProgram,
  TableColumn,
  useScheduleMutation,
} from '../../../common';
import {
  formatDefinitionSchedule,
  PROGRAM_TYPE_LABEL,
} from '../../../common/model/ledger';
import { ProgramForm as ProgramFormValue } from '../../model/policyForm';
import {
  getProgramGroupId,
  getProgramGroups,
  toProgramKey,
} from '../../model/programFormLink';
import ProgramForm from '../ProgramForm';
import ScheduleSection from '../ScheduleSection';

export type ProgramEditing = ScheduleProgram | 'new' | null;

/** 임시 저장 복원 시 열린 모달 대상 */
export const PROGRAM_FORM_ID = 'schedule-program-form';

interface ProgramSectionProps {
  expoId: string;
  programs: ScheduleProgram[];
  /** 넘기면 수정·등록 양식을 밖에서 연다. 없으면 표 안에서 관리한다 */
  editing?: ProgramEditing;
  onEditingChange?: (editing: ProgramEditing) => void;
  /** 폼을 만들고 돌아왔을 때 열린 양식에 채울 회차 초안 */
  draftForm?: ProgramFormValue;
}

/** 연수·일반 프로그램 ID 는 서로 겹칠 수 있어 표 행 키를 구분한다 */
interface ProgramRow {
  id: string;
  program: ScheduleProgram;
}

const formatPeriod = (program: ScheduleProgram) => {
  const start = fromOffsetDateTime(program.policy?.applicationStartedAt);
  const end = fromOffsetDateTime(program.policy?.applicationEndedAt);
  if (!start && !end) return '제한 없음';
  return `${start ? formatDateTimeValue(start) : ''} ~ ${end ? formatDateTimeValue(end) : ''}`;
};

const ProgramSection = ({
  expoId,
  programs,
  editing: controlledEditing,
  onEditingChange,
  draftForm,
}: ProgramSectionProps) => {
  const [ownEditing, setOwnEditing] = useState<ProgramEditing>(null);
  const editing =
    controlledEditing === undefined ? ownEditing : controlledEditing;
  const setEditing = onEditingChange ?? setOwnEditing;
  const groupIds = getProgramGroups(programs).map(({ groupId }) => groupId);
  const getGroupLabel = (program: ScheduleProgram) => {
    const index = groupIds.indexOf(getProgramGroupId(program) ?? '');
    return index < 0 ? null : `묶음 ${index + 1}`;
  };
  const { mutate: removeProgram, isPending: isDeleting } = useScheduleMutation(
    expoId,
    deleteScheduleProgram,
    '프로그램을 삭제했습니다.',
  );
  const { mutate: retry, isPending: isRetrying } = useScheduleMutation(
    expoId,
    () => retryProgramChanges(expoId),
    '중단된 프로그램 변경을 다시 처리했습니다.',
  );

  const pendingCount = programs.filter(
    ({ pendingRevision }) => pendingRevision !== null,
  ).length;

  const handleDelete = (program: ScheduleProgram) => {
    if (
      !window.confirm(
        `'${program.title}' 프로그램을 삭제할까요? 신청 이력이 있으면 삭제할 수 없습니다.`,
      )
    )
      return;
    removeProgram(program);
  };

  const columns: TableColumn<ProgramRow>[] = [
    {
      key: 'id',
      label: 'ID',
      flex: 0.4,
      render: ({ program }) => program.id,
    },
    {
      key: 'type',
      label: '구분',
      flex: 0.6,
      render: ({ program }) =>
        program.category
          ? `${PROGRAM_TYPE_LABEL[program.programType]} · ${program.category === 'ESSENTIAL' ? '필수' : '선택'}`
          : PROGRAM_TYPE_LABEL[program.programType],
    },
    {
      key: 'group',
      label: '묶음',
      flex: 0.5,
      render: ({ program }) =>
        getGroupLabel(program) ?? <p className="text-gray-400">-</p>,
    },
    {
      key: 'title',
      label: '프로그램명',
      flex: 1.4,
      render: ({ program }) => (
        <p className="truncate text-black">{program.title}</p>
      ),
    },
    {
      key: 'schedule',
      label: '일정',
      flex: 1.4,
      render: ({ program }) =>
        formatDefinitionSchedule(program.startedAt, program.endedAt),
    },
    {
      key: 'period',
      label: '모집 기간',
      flex: 1.4,
      render: ({ program }) => (program.policy ? formatPeriod(program) : '-'),
    },
    {
      key: 'capacity',
      label: '정원 / 대기',
      flex: 0.7,
      render: ({ program }) => {
        if (!program.policy) return '-';
        const {
          capacity,
          waitingCapacity,
          preRegistrationCapacity,
          onsiteCapacity,
        } = program.policy;
        const total = `${capacity ?? '-'} / ${waitingCapacity ?? 0}`;
        return (
          <>
            <p>{total}</p>
            <p className="text-caption2r">
              사전 {preRegistrationCapacity ?? '-'} · 현장{' '}
              {onsiteCapacity ?? '-'}
            </p>
          </>
        );
      },
    },
    {
      key: 'status',
      label: '상태',
      flex: 0.8,
      render: ({ program }) => {
        if (program.pendingRevision !== null)
          return <p className="text-red-500">변경 처리 중</p>;
        if (!program.policy) return <p className="text-gray-400">정책 없음</p>;
        return program.policy.closed ? (
          <p className="text-gray-400">마감</p>
        ) : (
          <p className="text-main-600">모집 중</p>
        );
      },
    },
    {
      key: 'actions',
      label: '관리',
      flex: 1.1,
      render: ({ program }) => (
        <div className="flex items-center justify-center gap-12">
          <button
            type="button"
            className="text-body2r text-main-600 disabled:opacity-40"
            disabled={program.pendingRevision !== null}
            onClick={(e) => {
              e.stopPropagation();
              setEditing(program);
            }}
          >
            수정
          </button>
          <button
            type="button"
            aria-label="프로그램 삭제"
            disabled={isDeleting}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(program);
            }}
            className="disabled:opacity-40"
          >
            <Trash />
          </button>
        </div>
      ),
    },
  ];

  const rows: ProgramRow[] = programs.map((program) => ({
    id: toProgramKey(program),
    program,
  }));

  return (
    <ScheduleSection title="① 프로그램 신청 회차">
      {pendingCount > 0 && (
        <div className="flex items-center justify-between gap-16 rounded-sm border-1 border-solid border-red-200 px-20 py-12 mobile:flex-col mobile:items-stretch">
          <p className="text-body2r text-red-500">
            변경이 끝나지 않은 프로그램이 {pendingCount}개 있습니다. 끝날 때까지
            해당 프로그램은 수정할 수 없습니다.
          </p>
          <Button
            variant="white"
            disabled={isRetrying}
            onClick={() => retry(undefined)}
          >
            {isRetrying ? '처리 중...' : '다시 처리'}
          </Button>
        </div>
      )}
      <RegistrationTable
        columns={columns}
        rows={rows}
        emptyText="등록된 프로그램 회차가 없습니다."
        footerText="프로그램 회차"
        footerCount={programs.length}
        minWidth="1200px"
        maxHeight="none"
      >
        <AddItemButton onClick={() => setEditing('new')} />
      </RegistrationTable>
      {editing && (
        <div
          id={PROGRAM_FORM_ID}
          className="bg-black/50 fixed inset-0 z-10 flex items-start justify-center overflow-y-auto p-16"
        >
          <div className="w-full max-w-[1000px] bg-white">
            <ProgramForm
              key={editing === 'new' ? 'new' : toProgramKey(editing)}
              expoId={expoId}
              program={editing === 'new' ? undefined : editing}
              programs={programs}
              initialForm={draftForm}
              onClose={() => setEditing(null)}
            />
          </div>
        </div>
      )}
    </ScheduleSection>
  );
};

export default ProgramSection;
