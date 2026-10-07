'use client';

import { useState } from 'react';
import {
  RegistrationProgram,
  RegistrationProgramType,
  RegistrationQrColor,
  RegistrationSession,
} from '@/shared/types/registration/type';
import { AddItemButton, Input, ToggleButton } from '@/shared/ui';
import {
  DateTimeInput,
  PROGRAM_TYPE_LABEL,
  QR_COLORS,
  RegistrationSelect,
  RegistrationTable,
  TableColumn,
} from '../../../common';
import ProgramCreateForm from '../ProgramCreateForm';
import ScheduleSection from '../ScheduleSection';

interface ProgramSectionProps {
  programs: RegistrationProgram[];
  sessions: RegistrationSession[];
  onChange: (id: number, patch: Partial<RegistrationProgram>) => void;
  isCreateDisabled: boolean;
}

const TYPE_OPTIONS = Object.entries(PROGRAM_TYPE_LABEL).map(
  ([value, label]) => ({ value, label }),
);
const QR_TYPE_OPTIONS = Object.keys(PROGRAM_TYPE_LABEL).map((value) => ({
  value,
  label: value,
}));
const QR_COLOR_OPTIONS = QR_COLORS.map((value) => ({ value, label: value }));

const ProgramSection = ({
  programs,
  sessions,
  onChange,
  isCreateDisabled,
}: ProgramSectionProps) => {
  const [isCreating, setIsCreating] = useState(false);

  const columns: TableColumn<RegistrationProgram>[] = [
    {
      key: 'code',
      label: '코드',
      render: (program) => (
        <p className="truncate text-black">{program.code}</p>
      ),
    },
    {
      key: 'name',
      label: '프로그램명',
      flex: 1.4,
      render: (program) => (
        <Input
          size="small"
          value={program.name}
          onChange={(e) => onChange(program.id, { name: e.target.value })}
        />
      ),
    },
    {
      key: 'type',
      label: '유형',
      render: (program) => (
        <RegistrationSelect
          size="small"
          value={program.type}
          options={TYPE_OPTIONS}
          onChange={(type) =>
            onChange(program.id, { type: type as RegistrationProgramType })
          }
        />
      ),
    },
    {
      key: 'qrType',
      label: 'QR 유형',
      render: (program) => (
        <RegistrationSelect
          size="small"
          value={program.qrType}
          options={QR_TYPE_OPTIONS}
          onChange={(qrType) =>
            onChange(program.id, { qrType: qrType as RegistrationProgramType })
          }
        />
      ),
    },
    {
      key: 'qrColor',
      label: 'QR 색',
      flex: 0.8,
      render: (program) => (
        <RegistrationSelect
          size="small"
          value={program.qrColor}
          options={QR_COLOR_OPTIONS}
          onChange={(qrColor) =>
            onChange(program.id, { qrColor: qrColor as RegistrationQrColor })
          }
        />
      ),
    },
    {
      key: 'max',
      label: '1인 최대',
      flex: 0.6,
      render: (program) => (
        <Input
          size="small"
          type="number"
          min={1}
          value={program.maxSessionsPerPerson}
          onChange={(e) =>
            onChange(program.id, {
              maxSessionsPerPerson: Number(e.target.value),
            })
          }
        />
      ),
    },
    {
      key: 'applyStartAt',
      label: '신청 시작',
      flex: 1.8,
      render: (program) => (
        <DateTimeInput
          size="small"
          value={program.applyStartAt}
          onChange={(applyStartAt) => onChange(program.id, { applyStartAt })}
        />
      ),
    },
    {
      key: 'applyEndAt',
      label: '신청 종료',
      flex: 1.8,
      render: (program) => (
        <DateTimeInput
          size="small"
          value={program.applyEndAt}
          onChange={(applyEndAt) => onChange(program.id, { applyEndAt })}
        />
      ),
    },
    {
      key: 'sessions',
      label: '회차',
      flex: 0.4,
      render: (program) =>
        sessions.filter(({ programId }) => programId === program.id).length,
    },
    {
      key: 'status',
      label: '신청',
      flex: 0.6,
      render: (program) => (
        <div className="flex justify-center">
          <ToggleButton
            value={program.status === 'OPEN'}
            onChange={(isOpen) =>
              onChange(program.id, { status: isOpen ? 'OPEN' : 'CLOSED' })
            }
          />
        </div>
      ),
    },
  ];

  return (
    <ScheduleSection
      title="프로그램"
      description="프로그램 이름·유형·QR·신청기간·신청 열림 여부를 관리합니다."
    >
      <RegistrationTable
        columns={columns}
        rows={programs}
        emptyText="등록된 프로그램이 없습니다."
        footerText="프로그램"
        footerCount={programs.length}
        minWidth="1500px"
        maxHeight="none"
      >
        {isCreating ? (
          <ProgramCreateForm onClose={() => setIsCreating(false)} />
        ) : (
          !isCreateDisabled && (
            <AddItemButton onClick={() => setIsCreating(true)} />
          )
        )}
      </RegistrationTable>
    </ScheduleSection>
  );
};

export default ProgramSection;
