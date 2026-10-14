'use client';

import { useState } from 'react';
import { retryProgramChanges } from '@/shared/api';
import { Trash } from '@/shared/assets/icons';
import { CheckBoxIcon, CheckedBoxIcon } from '@/shared/assets/svg';
import { AddItemButton, Button, Input, MockDataBadge } from '@/shared/ui';
import {
  deleteScheduleProgram,
  formatDateTimeValue,
  fromOffsetDateTime,
  RegistrationSelect,
  RegistrationTable,
  ScheduleProgram,
  TableColumn,
  useScheduleMutation,
} from '../../../common';
import {
  formatDefinitionSchedule,
  PROGRAM_TYPE_LABEL,
} from '../../../common/model/ledger';
import {
  getProgramMetaMock,
  ProgramMeta,
  ProgramQrColor,
} from '../../mock/programMeta';
import { toCount } from '../../model/sessionForm';
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
}

const MOCK_ISSUE = 'Expo-Expo-Server#110';

const KIND_OPTIONS = [
  'GENERAL',
  'GOLDENBELL',
  'TRAINING',
  'KEYNOTE',
  'ODYSSEY',
].map((value) => ({ value, label: value }));

const QR_TYPE_OPTIONS = [
  { value: 'PROGRAM', label: '프로그램' },
  { value: 'SESSION', label: '회차' },
  { value: 'NONE', label: '사용 안 함' },
];

// 디자인 토큰에 없는 QR 인쇄 색이라 데이터 색으로 직접 둔다
const QR_COLOR_HEX: Record<ProgramQrColor, string> = {
  BLACK: '#000000',
  GREEN: '#16a34a',
  BLUE: '#2563eb',
  PURPLE: '#7c3aed',
  RED: '#dc2626',
};

const QR_COLOR_OPTIONS = Object.keys(QR_COLOR_HEX).map((value) => ({
  value,
  label: value,
}));

const DUPLICATE_OPTIONS = [
  { value: 'LIMITED', label: '최대 N회' },
  { value: 'UNLIMITED', label: '제한 없음' },
];

/** 연수·일반 프로그램 ID 는 서로 겹칠 수 있어 표 행 키를 구분한다 */
interface ProgramRow {
  id: string;
  program: ScheduleProgram;
  /** 서버 연결 전 예시 값 */
  meta: ProgramMeta;
}

const toRowId = ({ programType, id }: ScheduleProgram) =>
  `${programType}-${id}`;

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
}: ProgramSectionProps) => {
  const [ownEditing, setOwnEditing] = useState<ProgramEditing>(null);
  const editing =
    controlledEditing === undefined ? ownEditing : controlledEditing;
  const setEditing = onEditingChange ?? setOwnEditing;
  // 서버 연결 전이라 예시 값 위에 화면에서 고친 값만 덮어쓴다
  const [metaEdits, setMetaEdits] = useState<Map<string, ProgramMeta>>(
    new Map(),
  );
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

  const updateMeta = (row: ProgramRow, patch: Partial<ProgramMeta>) =>
    setMetaEdits((prev) =>
      new Map(prev).set(row.id, { ...row.meta, ...patch }),
    );

  const columns: TableColumn<ProgramRow>[] = [
    {
      key: 'id',
      label: 'ID',
      flex: 0.4,
      render: ({ program }) => program.id,
    },
    {
      key: 'code',
      label: '코드',
      flex: 1.1,
      render: (row) => (
        <Input
          size="small"
          aria-label="프로그램 코드"
          value={row.meta.code}
          onChange={(e) =>
            updateMeta(row, { code: e.target.value.toUpperCase() })
          }
        />
      ),
    },
    {
      key: 'kind',
      label: '유형',
      flex: 1.1,
      render: (row) => (
        <RegistrationSelect
          size="small"
          ariaLabel="프로그램 유형"
          value={row.meta.kind}
          options={KIND_OPTIONS}
          onChange={(value) =>
            updateMeta(row, { kind: value as ProgramMeta['kind'] })
          }
        />
      ),
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
      render: ({ program }) =>
        program.policy
          ? `${program.policy.capacity ?? '-'} / ${program.policy.waitingCapacity ?? 0}`
          : '-',
    },
    {
      key: 'qrType',
      label: 'QR 유형',
      flex: 0.9,
      render: (row) => (
        <RegistrationSelect
          size="small"
          ariaLabel="QR 유형"
          value={row.meta.qrType}
          options={QR_TYPE_OPTIONS}
          onChange={(value) =>
            updateMeta(row, { qrType: value as ProgramMeta['qrType'] })
          }
        />
      ),
    },
    {
      key: 'qrColor',
      label: 'QR 색',
      flex: 1,
      render: (row) => (
        <div className="flex items-center gap-6">
          <span
            aria-hidden
            className="h-[12px] w-[12px] flex-none rounded-full"
            style={{ backgroundColor: QR_COLOR_HEX[row.meta.qrColor] }}
          />
          <RegistrationSelect
            size="small"
            ariaLabel="QR 색"
            value={row.meta.qrColor}
            options={QR_COLOR_OPTIONS}
            onChange={(value) =>
              updateMeta(row, { qrColor: value as ProgramQrColor })
            }
          />
        </div>
      ),
    },
    {
      key: 'maxSessions',
      label: '최대 N회',
      flex: 0.6,
      render: (row) => (
        <Input
          size="small"
          type="number"
          min={1}
          aria-label="1인 최대 회차"
          disabled={row.meta.duplicatePolicy === 'UNLIMITED'}
          value={row.meta.maxSessionsPerUser}
          onChange={(e) =>
            updateMeta(row, {
              maxSessionsPerUser: Math.max(toCount(e.target.value), 1),
            })
          }
        />
      ),
    },
    {
      key: 'duplicate',
      label: '중복 신청',
      flex: 0.9,
      render: (row) => (
        <RegistrationSelect
          size="small"
          ariaLabel="중복 신청"
          value={row.meta.duplicatePolicy}
          options={DUPLICATE_OPTIONS}
          onChange={(value) =>
            updateMeta(row, {
              duplicatePolicy: value as ProgramMeta['duplicatePolicy'],
            })
          }
        />
      ),
    },
    {
      key: 'blockTimeOverlap',
      label: '시간 중복 차단',
      flex: 0.7,
      render: (row) => (
        <button
          type="button"
          aria-label="시간 중복 차단"
          aria-pressed={row.meta.blockTimeOverlap}
          className="flex w-full justify-center"
          onClick={() =>
            updateMeta(row, { blockTimeOverlap: !row.meta.blockTimeOverlap })
          }
        >
          {row.meta.blockTimeOverlap ? <CheckedBoxIcon /> : <CheckBoxIcon />}
        </button>
      ),
    },
    {
      key: 'sessionCount',
      label: '회차수',
      flex: 0.5,
      render: (row) => row.meta.sessionCount,
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
      flex: 0.8,
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

  const rows: ProgramRow[] = programs.map((program) => {
    const id = toRowId(program);
    return {
      id,
      program,
      meta: metaEdits.get(id) ?? getProgramMetaMock(program),
    };
  });

  return (
    <ScheduleSection
      title="① 프로그램 마스터"
      description="모집 정책이 있는 프로그램만 참가자가 프로그램별로 신청합니다. 신청 이력이 있으면 정원은 확정 인원보다 줄일 수 없습니다."
    >
      <div className="flex flex-wrap items-center gap-8">
        <MockDataBadge issue={MOCK_ISSUE} />
        <p className="text-caption1r text-gray-500">
          코드·유형·QR 유형·QR 색·최대 N회·중복 신청·시간 중복 차단·회차수는
          예시 데이터입니다. 서버 연결 후 저장됩니다.
        </p>
      </div>
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
        emptyText="등록된 프로그램이 없습니다."
        footerText="프로그램"
        footerCount={programs.length}
        minWidth="2100px"
        maxHeight="none"
      >
        {editing ? (
          <div id={PROGRAM_FORM_ID} className="scroll-mt-[96px]">
            <ProgramForm
              key={editing === 'new' ? 'new' : toRowId(editing)}
              expoId={expoId}
              program={editing === 'new' ? undefined : editing}
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
