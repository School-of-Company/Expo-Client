'use client';

import { useQueryClient } from '@tanstack/react-query';
import { Loading } from '@/shared/ui';
import {
  RefreshStatus,
  scheduleQueryKeys,
  SectionError,
  usePreregisterSessions,
  useRegistrationExpo,
} from '../../../common';
import {
  getLedgerErrorMessage,
  isParticipantSourceError,
  LEDGER_REFRESH_MS,
  useCurrentSessions,
  useLedgerSummary,
  useRecentApplications,
} from '../../../common/model/ledger';
import {
  preregisterSummaryQueryKey,
  usePreregisterSummary,
} from '../../../common/model/preregisterSummary';
import MenuList from '../MenuList';
import PreregisterSessionTable from '../PreregisterSessionTable';
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
  const preregister = usePreregisterSummary(expoId);
  // 사전등록 회차 이름·일시와 Expo 대기 정원. 실패해도 회차 번호로 집계를 보여 준다
  const preregisterSessions = usePreregisterSessions(expoId);
  const queries = [summary, sessions, recent, preregister];

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
      queryClient.invalidateQueries({
        queryKey: preregisterSummaryQueryKey(expoId),
      }),
      queryClient.invalidateQueries({
        queryKey: scheduleQueryKeys.sessions(expoId),
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

      <Section title="사전등록 현황">
        {preregister.isError && !preregister.data ? (
          <SectionError
            message="사전등록 인원을 불러오지 못했습니다."
            onRetry={() => preregister.refetch()}
          />
        ) : preregister.data ? (
          <div className="space-y-12">
            <StatusList
              items={[
                {
                  label: '확정 인원',
                  value: `${preregister.data.confirmedUniqueParticipants.toLocaleString()}명`,
                },
                {
                  label: '취소 인원',
                  value: `${preregister.data.cancelledUniqueParticipants.toLocaleString()}명`,
                },
                {
                  label: '확정 전 예약',
                  value: `${preregister.data.pendingReservations.toLocaleString()}건`,
                  sub: `신청 인원 ${preregister.data.pendingApplicants.toLocaleString()}명`,
                },
              ]}
            />
            <p className="text-caption1r text-gray-400">
              행사 사전등록 기준 고유 인원입니다. 대표자와 동행자를 각각 한
              명으로 세며, 취소 인원은 다시 등록한 확정 인원과 겹칠 수 있습니다.
              프로그램 신청·출석 건수는 포함하지 않습니다.
            </p>
            {preregisterSessions.isError && (
              <p role="status" className="text-caption1r text-gray-400">
                사전등록 회차 정보를 불러오지 못해 회차 번호로 표시합니다. 대기
                정원 적용은 회차 정보를 불러온 뒤 할 수 있습니다.
              </p>
            )}
            <PreregisterSessionTable
              expoId={expoId}
              summaries={preregister.data.sessions}
              sessions={preregisterSessions.data}
            />
            <p className="text-caption1r text-gray-400">
              대기는 확정 전 일행 기준이며, 선두 일행이 빈 확정석보다 많으면
              순서대로 승급하기 위해 대기 승급이 멈춥니다. 대기 정원이 미적용인
              회차는 대기를 받지 않으므로 현재 회차 대기 정원을 적용해야 합니다.
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
          <RecentLedgerTable rows={recent.data} />
        ) : (
          <SectionLoading />
        )}
      </Section>
    </div>
  );
};

export default RegistrationDashboard;
