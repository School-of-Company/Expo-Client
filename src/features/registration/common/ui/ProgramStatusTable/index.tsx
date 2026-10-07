'use client';

import { useRouter } from 'next/navigation';
import {
  RegistrationProgram,
  RegistrationSession,
} from '@/shared/types/registration/type';
import { REGISTRATION_ROUTES } from '../../config/routes';
import { SessionStat } from '../../lib/buildApplicationRows';
import RegistrationTable, { TableColumn } from '../RegistrationTable';

interface ProgramStatusTableProps {
  programs: RegistrationProgram[];
  sessions: RegistrationSession[];
  sessionStats: Map<number, SessionStat>;
}

interface ProgramStatusRow {
  id: number;
  program: RegistrationProgram;
  sessionCount: number;
  capacity: number;
  waitlistCapacity: number;
  confirmed: number;
  waiting: number;
}

const COLUMNS: TableColumn<ProgramStatusRow>[] = [
  {
    key: 'program',
    label: '프로그램',
    flex: 2,
    render: ({ program }) => (
      <p className="truncate text-black">{program.name}</p>
    ),
  },
  {
    key: 'status',
    label: '신청',
    render: ({ program }) => (
      <span className={program.status === 'OPEN' ? 'text-main-600' : ''}>
        {program.status === 'OPEN' ? '진행 중' : '마감'}
      </span>
    ),
  },
  { key: 'sessions', label: '회차', render: (row) => row.sessionCount },
  {
    key: 'capacity',
    label: '정원',
    render: (row) => row.capacity.toLocaleString(),
  },
  {
    key: 'confirmed',
    label: '확정',
    render: (row) => (
      <span className="text-main-600">{row.confirmed.toLocaleString()}</span>
    ),
  },
  {
    key: 'waiting',
    label: '대기 / 대기정원',
    render: (row) => `${row.waiting} / ${row.waitlistCapacity}`,
  },
];

const ProgramStatusTable = ({
  programs,
  sessions,
  sessionStats,
}: ProgramStatusTableProps) => {
  const router = useRouter();

  const rows: ProgramStatusRow[] = programs.map((program) =>
    sessions
      .filter(({ programId }) => programId === program.id)
      .reduce(
        (acc, session) => {
          const stat = sessionStats.get(session.id);
          return {
            ...acc,
            sessionCount: acc.sessionCount + 1,
            capacity: acc.capacity + session.capacity,
            waitlistCapacity: acc.waitlistCapacity + session.waitlistCapacity,
            confirmed: acc.confirmed + (stat?.confirmed ?? 0),
            waiting: acc.waiting + (stat?.waiting ?? 0),
          };
        },
        {
          id: program.id,
          program,
          sessionCount: 0,
          capacity: 0,
          waitlistCapacity: 0,
          confirmed: 0,
          waiting: 0,
        },
      ),
  );

  return (
    <RegistrationTable
      columns={COLUMNS}
      rows={rows}
      emptyText="등록된 프로그램이 없습니다."
      footerText="프로그램"
      footerCount={rows.length}
      maxHeight="none"
      onRowClick={({ id }) =>
        router.push(`${REGISTRATION_ROUTES.applications}?programId=${id}`)
      }
    />
  );
};

export default ProgramStatusTable;
