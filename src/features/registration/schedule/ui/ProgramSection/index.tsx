'use client';

import { useEffect, useState } from 'react';
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
  toGroupSessionForm,
  toProgramKey,
} from '../../model/programFormLink';
import ProgramForm from '../ProgramForm';
import ScheduleSection from '../ScheduleSection';

export type ProgramEditing = ScheduleProgram | 'new' | null;

/** 왼쪽 메뉴에서 등록 양식을 열 때 스크롤할 대상 */
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
  // 같은 묶음에 회차를 추가할 때 새 회차 양식에 채울 값
  const [groupTemplate, setGroupTemplate] = useState<ProgramFormValue>();
  useEffect(() => {
    if (editing !== 'new') setGroupTemplate(undefined);
  }, [editing]);
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
        const { capacity, waitingCapacity, channels } = program.policy;
        const total = `${capacity ?? '-'} / ${waitingCapacity ?? 0}`;
        // 채널이 있으면 신청 구분별 정원을 함께 보여 준다
        return channels?.length ? (
          <p
            className="truncate"
            title={channels
              .map((c) => `${c.name} ${c.capacity} / ${c.waitingCapacity}`)
              .join(', ')}
          >
            {total} · 채널 {channels.length}
          </p>
        ) : (
          total
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
          {getGroupLabel(program) && (
            <button
              type="button"
              className="whitespace-nowrap text-body2r text-main-600"
              title="이 회차의 폼·정원·모집 조건을 복사해 같은 묶음에 새 회차를 만듭니다"
              onClick={(e) => {
                e.stopPropagation();
                setEditing('new');
                setGroupTemplate(toGroupSessionForm(program));
              }}
            >
              회차 추가
            </button>
          )}
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
    <ScheduleSection
      title="① 프로그램 신청 회차"
      description="표의 한 줄이 참가자가 신청하는 프로그램 회차 하나입니다. 같은 프로그램을 여러 시간에 열면 회차마다 줄을 만들고 '묶음'으로 묶어, 참가자가 묶음 안에서 하나만 신청하게 합니다. 묶인 회차의 '회차 추가'로 폼·정원을 복사해 회차를 늘릴 수 있습니다. 신청 폼은 '온라인 신청 받기'를 켠 회차에서 연결합니다. 신청 이력이 있으면 정원은 확정 인원보다 줄일 수 없습니다."
    >
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
        {editing ? (
          <div id={PROGRAM_FORM_ID} className="scroll-mt-[96px]">
            <ProgramForm
              key={
                editing === 'new'
                  ? `new-${groupTemplate?.policy.groupId ?? ''}`
                  : toProgramKey(editing)
              }
              expoId={expoId}
              program={editing === 'new' ? undefined : editing}
              programs={programs}
              initialForm={draftForm ?? groupTemplate}
              onClose={() => setEditing(null)}
            />
          </div>
        ) : (
          <AddItemButton onClick={() => setEditing('new')} />
        )}
      </RegistrationTable>
    </ScheduleSection>
  );
};

export default ProgramSection;
