'use client';

import { useMemo } from 'react';
import { RegistrationTable, TableColumn } from '../../../common';
import {
  AdminSessionSummary,
  ProgramSessionDefinition,
} from '../../../common/api/ledgerApi';
import { PROGRAM_TYPE_LABEL } from '../../../common/model/ledger';
import {
  groupSessionsByProgram,
  ProgramGroup,
} from '../../model/programGroups';

const COLUMNS: TableColumn<ProgramGroup>[] = [
  {
    key: 'program',
    label: '프로그램',
    flex: 2.6,
    render: ({ title, programType }) => (
      <>
        <p className="truncate text-black">{title}</p>
        <p className="text-caption2r">{PROGRAM_TYPE_LABEL[programType]}</p>
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
    // 정책이 없는 회차는 정원에 넣지 않으므로, 정원 0 이나 마감으로 보이지 않게 따로 알린다
    render: ({ capacity, sessionCount, unsetSessionCount }) =>
      unsetSessionCount === sessionCount ? (
        <span className="text-caption1r text-gray-500">모집 설정 필요</span>
      ) : (
        <>
          <p>{capacity.toLocaleString()}</p>
          {unsetSessionCount > 0 && (
            <p className="text-caption2r">
              모집 설정 필요 {unsetSessionCount}회차 제외
            </p>
          )}
        </>
      ),
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
    render: ({ waitingCapacity, sessionCount, unsetSessionCount }) =>
      unsetSessionCount === sessionCount
        ? '-'
        : waitingCapacity.toLocaleString(),
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

/** 현재 회차를 묶음별로 묶어 정원과 확정·대기를 합친다 */
const ProgramStatusTable = ({
  sessions,
  summaries,
}: ProgramStatusTableProps) => {
  const rows = useMemo(
    () => groupSessionsByProgram(sessions, summaries),
    [sessions, summaries],
  );

  return (
    <>
      <p className="mb-8 text-caption1r text-gray-400">
        같은 묶음(groupId)의 회차를 한 프로그램으로 묶었습니다. 묶음이 없는
        회차는 따로 표시하며, 확정·대기는 회차별 신청 건수의 합입니다.
      </p>
      <RegistrationTable
        columns={COLUMNS}
        rows={rows}
        emptyText="등록된 프로그램이 없습니다."
        footerText="프로그램"
        footerCount={rows.length}
        maxHeight="none"
        // 대시보드 왼쪽 칸(1280px 화면에서 약 690px)에 다 들어가게 한다. 더 좁으면 가로로 넘긴다
        minWidth="600px"
      />
    </>
  );
};

export default ProgramStatusTable;
