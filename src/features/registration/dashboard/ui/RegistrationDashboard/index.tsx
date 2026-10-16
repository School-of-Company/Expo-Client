'use client';

import Link from 'next/link';
import { ReactNode, useMemo } from 'react';
import { Loading } from '@/shared/ui';
import { SectionError, useRegistrationExpo } from '../../../common';
import {
  getLedgerErrorMessage,
  getSummaryErrorMessage,
  isParticipantSourceError,
  useCurrentSessions,
  useLedgerSummary,
  useRecentApplications,
} from '../../../common/model/ledger';
import {
  countSessionsByRecruitment,
  groupSessionsByProgram,
} from '../../model/programGroups';
import MonitoringCards from '../MonitoringCards';
import RecentLedgerTable from '../RecentLedgerTable';
import SummaryCards from '../SummaryCards';

const Section = ({
  title,
  description,
  href,
  children,
}: {
  title: string;
  description?: string;
  /** 같은 내용을 더 자세히 보는 화면 */
  href?: string;
  children: ReactNode;
}) => (
  <section className="min-w-0 space-y-16">
    <div className="flex items-end justify-between gap-16">
      <div className="min-w-0 space-y-6">
        <p className="text-h3b text-black">{title}</p>
        {description && (
          <p className="text-caption1r text-gray-400">{description}</p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="shrink-0 whitespace-nowrap text-body2r text-main-600 underline mobile:text-caption1r"
        >
          전체 보기
        </Link>
      )}
    </div>
    {children}
  </section>
);

const SectionLoading = () => (
  <div className="flex justify-center py-40">
    <Loading />
  </div>
);

/** 보는 정보는 이 화면에 모으고, 입력·발송·인쇄 같은 작업은 각 화면으로 보낸다 */
const RegistrationDashboard = () => {
  const { expoId, expo, routes } = useRegistrationExpo();
  // 각 영역은 따로 조회해서 하나가 실패해도 나머지는 보여 준다
  const summary = useLedgerSummary(expoId);
  const sessions = useCurrentSessions(expoId);
  const recent = useRecentApplications(expoId);

  const counts = summary.data?.statusCounts;
  const sessionCounts = sessions.data
    ? countSessionsByRecruitment(sessions.data)
    : null;
  const programCount = useMemo(
    () =>
      sessions.data ? groupSessionsByProgram(sessions.data, null).length : null,
    [sessions.data],
  );

  return (
    <div className="flex w-full max-w-[1200px] flex-col space-y-24">
      <div className="space-y-16">
        <p className="text-h1m text-black mobile:text-h2b">{expo?.title}</p>
        <SummaryCards
          programCount={programCount}
          sessionCount={sessions.data?.length ?? null}
          confirmed={summary.data ? (counts?.CONFIRMED ?? 0) : null}
          waiting={summary.data ? (counts?.WAITING ?? 0) : null}
          uniqueParticipants={summary.data?.uniqueParticipants ?? null}
        />
        {summary.isError && !summary.data && (
          <SectionError
            message={getSummaryErrorMessage(
              summary.error,
              '신청 현황을 불러오지 못했습니다. 출석 집계 원천이 응답하지 않으면 현황 전체가 실패할 수 있습니다.',
            )}
            onRetry={() => summary.refetch()}
          />
        )}
      </div>

      <Section title="운영 지표">
        <MonitoringCards expoId={expoId} sessionCounts={sessionCounts} />
      </Section>

      <Section title="최근 실시간 접수 동향" href={routes.applications}>
        {recent.isError &&
        (!recent.data || isParticipantSourceError(recent.error)) ? (
          <SectionError
            message={getLedgerErrorMessage(
              recent.error,
              '최근 신청을 불러오지 못했습니다.',
            )}
            onRetry={() => recent.refetch()}
          />
        ) : recent.data ? (
          <RecentLedgerTable rows={recent.data.slice(0, 5)} />
        ) : (
          <SectionLoading />
        )}
      </Section>
    </div>
  );
};

export default RegistrationDashboard;
