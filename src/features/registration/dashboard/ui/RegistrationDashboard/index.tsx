'use client';

import { useMemo } from 'react';
import { withLoading } from '@/shared/hocs';
import {
  buildApplicationRows,
  FUTURE_EDU_EXPO_INFO,
  ProgramStatusTable,
  getSessionStats,
  useRegistrationOverview,
} from '../../../common';
import DailySchedule from '../DailySchedule';
import MenuList from '../MenuList';
import MonitoringSummary from '../MonitoringSummary';
import RecentApplicationTable from '../RecentApplicationTable';
import StatusList from '../StatusList';

const RECENT_APPLICATION_COUNT = 10;

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="space-y-[26px]">
    <p className="text-h2b text-black">{title}</p>
    {children}
  </section>
);

const RegistrationDashboard = () => {
  const { data, isLoading } = useRegistrationOverview();

  const summary = useMemo(() => {
    if (!data) return null;
    const rows = buildApplicationRows(data);
    const activeRows = rows.filter(({ status }) => status !== 'CANCELED');
    const confirmedCount = rows.filter(
      ({ status }) => status === 'CONFIRMED',
    ).length;
    return {
      sessionStats: getSessionStats(data.applications),
      confirmedCount,
      waitingCount: rows.filter(({ status }) => status === 'WAITING').length,
      verifiedCount: new Set(
        activeRows.map(({ verifiedPhoneNumber }) => verifiedPhoneNumber),
      ).size,
      participantCount: activeRows.length,
      capacity: data.sessions.reduce((sum, { capacity }) => sum + capacity, 0),
      waitlistCapacity: data.sessions.reduce(
        (sum, { waitlistCapacity }) => sum + waitlistCapacity,
        0,
      ),
      openProgramCount: data.programs.filter(({ status }) => status === 'OPEN')
        .length,
      recentRows: [...rows]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, RECENT_APPLICATION_COUNT),
    };
  }, [data]);

  return withLoading({
    isLoading: isLoading || !data || !summary,
    children: data && summary && (
      <div className="flex w-full max-w-[1200px] flex-1 flex-col space-y-[80px] overflow-y-auto">
        <p className="text-h1m text-black mobile:text-h2b">
          {FUTURE_EDU_EXPO_INFO.name}
        </p>

        <Section title="신청 현황">
          <div className="space-y-16">
            <StatusList
              items={[
                {
                  label: '확정',
                  value: `${summary.confirmedCount.toLocaleString()}명`,
                  sub: `정원 ${summary.capacity.toLocaleString()}석`,
                },
                {
                  label: '대기',
                  value: `${summary.waitingCount.toLocaleString()}명`,
                  sub: `대기정원 ${summary.waitlistCapacity.toLocaleString()}석`,
                },
                {
                  label: '프로그램',
                  value: `${data.programs.length}개`,
                  sub: `신청 중 ${summary.openProgramCount}개 · ${data.sessions.length}개 회차`,
                },
                {
                  label: '휴대전화 인증',
                  value: `${summary.verifiedCount.toLocaleString()}건`,
                  sub: `참가자 ${summary.participantCount}명`,
                },
              ]}
            />
            <MonitoringSummary activeQrCount={summary.confirmedCount} />
          </div>
        </Section>

        <Section title="관리 메뉴">
          <MenuList />
        </Section>

        <Section title="일자별 일정">
          <DailySchedule
            programs={data.programs}
            sessions={data.sessions}
            sessionStats={summary.sessionStats}
          />
        </Section>

        <Section title="프로그램별 신청 현황">
          <ProgramStatusTable
            programs={data.programs}
            sessions={data.sessions}
            sessionStats={summary.sessionStats}
          />
        </Section>

        <Section title="최근 접수">
          <RecentApplicationTable rows={summary.recentRows} />
        </Section>
      </div>
    ),
  });
};

export default RegistrationDashboard;
