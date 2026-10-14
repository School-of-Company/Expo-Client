'use client';

import { useMemo } from 'react';
import { MockDataBadge } from '@/shared/ui';
import { RegistrationTable, TableColumn } from '../../../common';
import {
  AdminSessionSummary,
  ProgramSessionDefinition,
} from '../../../common/api/ledgerApi';
import { PROGRAM_TYPE_LABEL } from '../../../common/model/ledger';
import { getProgramCode, PROGRAM_CODE_ISSUE } from '../../mock/programCode';
import {
  groupSessionsByProgram,
  ProgramGroup,
} from '../../model/programGroups';

type ProgramStatusRow = ProgramGroup & { code: string };

const COLUMNS: TableColumn<ProgramStatusRow>[] = [
  {
    key: 'program',
    label: '프로그램',
    flex: 2.6,
    render: ({ title, code, programType }) => (
      <>
        <p className="truncate text-black">{title}</p>
        <p className="text-caption2r">
          {code} · {PROGRAM_TYPE_LABEL[programType]}
        </p>
      </>
    ),
  },
  {
    key: 'sessionCount',
    label: '회차수',
    flex: 0.7,
    render: ({ sessionCount }) => sessionCount,
  },
  {
    key: 'capacity',
    label: '전체 정원',
    flex: 0.8,
    render: ({ capacity }) => capacity.toLocaleString(),
  },
  {
    key: 'confirmed',
    label: '확정',
    flex: 0.7,
    render: ({ confirmed }) => (
      <span className="text-main-600">
        {confirmed?.toLocaleString() ?? '-'}
      </span>
    ),
  },
  {
    key: 'waitingCapacity',
    label: '대기 정원',
    flex: 0.8,
    render: ({ waitingCapacity }) => waitingCapacity.toLocaleString(),
  },
  {
    key: 'waiting',
    label: '대기',
    flex: 0.7,
    render: ({ waiting }) => waiting?.toLocaleString() ?? '-',
  },
];

interface ProgramStatusTableProps {
  sessions: ProgramSessionDefinition[];
  /** null 이면 집계 조회 실패 */
  summaries: AdminSessionSummary[] | null;
}

/** 현재 회차를 프로그램별로 묶어 정원과 확정·대기를 합친다 */
const ProgramStatusTable = ({
  sessions,
  summaries,
}: ProgramStatusTableProps) => {
  const rows = useMemo(() => {
    const indexByType = { STANDARD: 0, TRAINING: 0 };
    return groupSessionsByProgram(sessions, summaries).map((group) => ({
      ...group,
      code: getProgramCode(group.programType, indexByType[group.programType]++),
    }));
  }, [sessions, summaries]);

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center gap-8">
        <p className="text-caption1r text-gray-400">
          구분과 이름이 같은 회차를 한 프로그램으로 묶었습니다. 프로그램 코드는
          임시 번호입니다.
        </p>
        <MockDataBadge issue={PROGRAM_CODE_ISSUE} />
      </div>
      <RegistrationTable
        columns={COLUMNS}
        rows={rows}
        emptyText="등록된 프로그램이 없습니다."
        footerText="프로그램"
        footerCount={rows.length}
        maxHeight="none"
        minWidth="760px"
      />
    </>
  );
};

export default ProgramStatusTable;
