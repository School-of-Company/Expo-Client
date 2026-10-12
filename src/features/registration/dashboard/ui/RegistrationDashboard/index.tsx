'use client';

import { useQueryClient } from '@tanstack/react-query';
import { Loading } from '@/shared/ui';
import {
  RefreshStatus,
  SectionError,
  useRegistrationExpo,
} from '../../../common';
import {
  getLedgerErrorMessage,
  LEDGER_REFRESH_MS,
  useCurrentSessions,
  useLedgerSummary,
  useRecentApplications,
} from '../../../common/model/ledger';
import MenuList from '../MenuList';
import RecentLedgerTable from '../RecentLedgerTable';
import SessionStatusTable from '../SessionStatusTable';
import StatusList from '../StatusList';

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

const SectionLoading = () => (
  <div className="flex justify-center py-40">
    <Loading />
  </div>
);

const RegistrationDashboard = () => {
  const queryClient = useQueryClient();
  const { expoId, expo } = useRegistrationExpo();
  // 각 영역은 따로 조회해서 하나가 실패해도 나머지는 보여 준다
  const summary = useLedgerSummary(expoId);
  const sessions = useCurrentSessions(expoId);
  const recent = useRecentApplications(expoId);
  const queries = [summary, sessions, recent];

  const updatedAt = Math.max(
    ...queries.map(({ dataUpdatedAt }) => dataUpdatedAt),
  );
  const isFetching = queries.some(({ isFetching }) => isFetching);
  const handleRefresh = () =>
    Promise.all([
      queryClient.invalidateQueries({
        queryKey: ['adminApplicationSummary', expoId],
      }),
      queryClient.invalidateQueries({
        queryKey: ['adminCurrentSessions', expoId],
      }),
      queryClient.invalidateQueries({
        queryKey: ['adminApplications', expoId],
      }),
    ]);

  const counts = summary.data?.statusCounts;

  return (
    <div className="flex w-full max-w-[1200px] flex-1 flex-col space-y-[80px] overflow-y-auto">
      <div className="flex items-end justify-between gap-16 mobile:flex-col mobile:items-start">
        <p className="text-h1m text-black mobile:text-h2b">{expo?.title}</p>
        <RefreshStatus
          updatedAt={updatedAt}
          isFetching={isFetching}
          onRefresh={handleRefresh}
          intervalMs={LEDGER_REFRESH_MS}
          hasError={queries.some(({ isError }) => isError)}
        />
      </div>

      <Section title="프로그램 신청 현황">
        {summary.isError && !summary.data ? (
          <SectionError
            message="신청 현황을 불러오지 못했습니다. 출석 집계 원천이 응답하지 않으면 현황 전체가 실패할 수 있습니다."
            onRetry={() => summary.refetch()}
          />
        ) : summary.data ? (
          <div className="space-y-12">
            <StatusList
              items={[
                {
                  label: '신청',
                  value: `${summary.data.totalElements.toLocaleString()}건`,
                  sub: `회차 ${summary.data.totalSessions}개`,
                },
                {
                  label: '고유 참가자',
                  value: `${summary.data.uniqueParticipants.toLocaleString()}명`,
                },
                {
                  label: '확정',
                  value: `${(counts?.CONFIRMED ?? 0).toLocaleString()}건`,
                },
                {
                  label: '대기 · 취소',
                  value: `${(counts?.WAITING ?? 0).toLocaleString()}건`,
                  sub: `취소 ${(counts?.CANCELLED ?? 0).toLocaleString()}건`,
                },
              ]}
            />
            <p className="text-caption1r text-gray-400">
              프로그램 회차 신청 기준입니다. 행사 입장·사전등록 인원은 포함하지
              않습니다.
            </p>
          </div>
        ) : (
          <SectionLoading />
        )}
      </Section>

      <Section title="관리 메뉴">
        <MenuList />
      </Section>

      <Section title="회차별 현황">
        {sessions.isError && !sessions.data ? (
          <SectionError
            message="회차 목록을 불러오지 못했습니다."
            onRetry={() => sessions.refetch()}
          />
        ) : sessions.data ? (
          <>
            {summary.isError && (
              <p role="status" className="text-caption1r text-gray-400">
                신청·출석 집계를 불러오지 못해 정원만 표시합니다.
              </p>
            )}
            <SessionStatusTable
              sessions={sessions.data}
              summaries={summary.data?.sessions ?? []}
            />
          </>
        ) : (
          <SectionLoading />
        )}
      </Section>

      <Section title="최근 신청">
        {recent.isError && !recent.data ? (
          <SectionError
            message={getLedgerErrorMessage(
              recent.error,
              '최근 신청을 불러오지 못했습니다.',
            )}
            onRetry={() => recent.refetch()}
          />
        ) : recent.data ? (
          <RecentLedgerTable rows={recent.data} />
        ) : (
          <SectionLoading />
        )}
      </Section>
    </div>
  );
};

export default RegistrationDashboard;
