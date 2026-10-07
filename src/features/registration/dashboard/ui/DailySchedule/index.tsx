'use client';

import { useRouter } from 'next/navigation';
import {
  RegistrationProgram,
  RegistrationSession,
} from '@/shared/types/registration/type';
import {
  formatDateWithWeekday,
  formatSessionTime,
  REGISTRATION_ROUTES,
  RegistrationTable,
  SessionStat,
  TableColumn,
} from '../../../common';

interface DailyScheduleProps {
  programs: RegistrationProgram[];
  sessions: RegistrationSession[];
  sessionStats: Map<number, SessionStat>;
}

interface ScheduleRow {
  id: number;
  session: RegistrationSession;
  program: RegistrationProgram;
  stat?: SessionStat;
}

const COLUMNS: TableColumn<ScheduleRow>[] = [
  {
    key: 'time',
    label: '시간',
    render: ({ session }) => formatSessionTime(session),
  },
  {
    key: 'program',
    label: '프로그램',
    flex: 1.6,
    render: ({ program }) => (
      <p className="truncate text-black">{program.name}</p>
    ),
  },
  {
    key: 'session',
    label: '회차',
    flex: 1.3,
    render: ({ session }) => <p className="truncate">{session.name}</p>,
  },
  {
    key: 'place',
    label: '장소',
    render: ({ session }) => <p className="truncate">{session.place}</p>,
  },
  {
    key: 'capacity',
    label: '확정 / 정원',
    render: ({ session, stat }) => (
      <>
        <span className="text-main-600">{stat?.confirmed ?? 0}</span> /{' '}
        {session.capacity}
      </>
    ),
  },
  {
    key: 'waiting',
    label: '대기',
    flex: 0.6,
    render: ({ stat }) => stat?.waiting ?? 0,
  },
  {
    key: 'status',
    label: '신청',
    flex: 0.6,
    render: ({ program }) =>
      program.status === 'OPEN' ? (
        <span className="text-main-600">진행 중</span>
      ) : (
        '마감'
      ),
  },
];

const DailySchedule = ({
  programs,
  sessions,
  sessionStats,
}: DailyScheduleProps) => {
  const router = useRouter();
  const programById = new Map(programs.map((program) => [program.id, program]));
  const dates = Array.from(new Set(sessions.map(({ date }) => date))).sort();

  return (
    <div className="space-y-[40px]">
      {dates.map((date) => {
        const rows: ScheduleRow[] = sessions
          .filter((session) => session.date === date)
          .sort((a, b) => a.startTime.localeCompare(b.startTime))
          .flatMap((session) => {
            const program = programById.get(session.programId);
            return program
              ? [
                  {
                    id: session.id,
                    session,
                    program,
                    stat: sessionStats.get(session.id),
                  },
                ]
              : [];
          });

        return (
          <div key={date} className="space-y-16">
            <p className="text-h3b text-black">{formatDateWithWeekday(date)}</p>
            <RegistrationTable
              columns={COLUMNS}
              rows={rows}
              emptyText="이 날 진행하는 회차가 없습니다."
              footerText="회차"
              footerCount={rows.length}
              maxHeight="none"
              onRowClick={({ program }) =>
                router.push(
                  `${REGISTRATION_ROUTES.applications}?programId=${program.id}`,
                )
              }
            />
          </div>
        );
      })}
    </div>
  );
};

export default DailySchedule;
