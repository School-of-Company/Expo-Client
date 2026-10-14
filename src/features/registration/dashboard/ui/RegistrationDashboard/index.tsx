'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Loading } from '@/shared/ui';
import {
  RefreshStatus,
  scheduleQueryKeys,
  SectionError,
  SegmentTabs,
  usePreregisterSessions,
  useRegistrationExpo,
} from '../../../common';
import {
  getLedgerErrorMessage,
  getSummaryErrorMessage,
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
import {
  countOpenSessions,
  groupSessionsByProgram,
} from '../../model/programGroups';
import { todayEntryQueryKey } from '../../model/useTodayEntry';
import MenuList from '../MenuList';
import MonitoringCards from '../MonitoringCards';
import PreregisterBanner from '../PreregisterBanner';
import PreregisterSessionTable from '../PreregisterSessionTable';
import ProgramStatusTable from '../ProgramStatusTable';
import RecentLedgerTable from '../RecentLedgerTable';
import SessionStatusTable from '../SessionStatusTable';
import SummaryCards from '../SummaryCards';

type ProgramView = 'program' | 'session' | 'preregister';

const PROGRAM_VIEW_OPTIONS: { value: ProgramView; label: string }[] = [
  { value: 'program', label: '프로그램별' },
  { value: 'session', label: '회차별 상세' },
  { value: 'preregister', label: '사전등록 회차' },
];

const Section = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) => (
  <section className="space-y-[26px]">
    <div className="space-y-8">
      <p className="text-h2b text-black">{title}</p>
      {description && (
        <p className="text-caption1r text-gray-400">{description}</p>
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

const RegistrationDashboard = () => {
  const queryClient = useQueryClient();
  const { expoId, expo } = useRegistrationExpo();
  const [programView, setProgramView] = useState<ProgramView>('program');
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
    Promise.all(
      [
        ['adminApplicationSummary', expoId],
        ['adminCurrentSessions', expoId],
        ['adminApplications', expoId],
        preregisterSummaryQueryKey(expoId),
        scheduleQueryKeys.sessions(expoId),
        todayEntryQueryKey(expoId),
      ].map((queryKey) => queryClient.invalidateQueries({ queryKey })),
    );

  const counts = summary.data?.statusCounts;
  const programCount = useMemo(
    () =>
      sessions.data ? groupSessionsByProgram(sessions.data, null).length : null,
    [sessions.data],
  );

  return (
    <div className="flex w-full max-w-[1200px] flex-1 flex-col space-y-[80px] overflow-y-auto">
      <div className="space-y-[26px]">
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
        <SummaryCards
          expoId={expoId}
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
        <p className="text-caption1r text-gray-400">
          확정·대기는 프로그램 회차 신청 건수 합계입니다. 행사 사전등록 인원은
          포함하지 않습니다.
        </p>
      </div>

      <Section
        title="실시간 운영 모니터링"
        description="신청화면 접속량과 지금 신청을 받는 회차, 오늘 입장 처리 건수입니다."
      >
        <MonitoringCards
          expoId={expoId}
          openSessionCount={
            sessions.data ? countOpenSessions(sessions.data) : null
          }
        />
      </Section>

      <Section title="주요 관리 메뉴">
        <MenuList />
      </Section>

      <Section
        title="프로그램별 신청 현황"
        description="프로그램 회차 신청 기준입니다. 회차별 상세에서 행을 누르면 그 회차의 접수 관리대장으로 이동합니다."
      >
        {preregister.isError && !preregister.data ? (
          <SectionError
            message={getSummaryErrorMessage(
              preregister.error,
              '사전등록 인원을 불러오지 못했습니다.',
            )}
            onRetry={() => preregister.refetch()}
          />
        ) : (
          preregister.data && (
            <PreregisterBanner expoId={expoId} summary={preregister.data} />
          )
        )}
        <SegmentTabs
          ariaLabel="신청 현황 보기"
          value={programView}
          options={PROGRAM_VIEW_OPTIONS}
          onChange={setProgramView}
        />
        {programView === 'preregister' ? (
          preregister.data ? (
            <div className="space-y-12">
              {preregisterSessions.isError && (
                <p role="status" className="text-caption1r text-gray-400">
                  사전등록 회차 정보를 불러오지 못해 회차 번호로 표시합니다.
                  대기 정원 적용은 회차 정보를 불러온 뒤 할 수 있습니다.
                </p>
              )}
              <PreregisterSessionTable
                expoId={expoId}
                summaries={preregister.data.sessions}
                sessions={preregisterSessions.data}
              />
              <p className="text-caption1r text-gray-400">
                행사 사전등록 기준 고유 인원입니다. 대표자와 동행자를 각각 한
                명으로 세며, 대기는 확정 전 일행 기준입니다. 선두 일행이 빈
                확정석보다 많으면 순서대로 승급하기 위해 대기 승급이 멈춥니다.
                대기 정원이 미적용인 회차는 대기를 받지 않으므로 현재 회차 대기
                정원을 적용해야 합니다.
              </p>
            </div>
          ) : (
            !preregister.isError && <SectionLoading />
          )
        ) : sessions.isError && !sessions.data ? (
          <SectionError
            message="회차 목록을 불러오지 못했습니다."
            onRetry={() => sessions.refetch()}
          />
        ) : sessions.data ? (
          <div>
            {summary.isError && (
              <p role="status" className="mb-8 text-caption1r text-gray-400">
                신청·출석 집계를 불러오지 못해 정원만 표시합니다.
              </p>
            )}
            {programView === 'program' ? (
              <ProgramStatusTable
                sessions={sessions.data}
                summaries={summary.data?.sessions ?? null}
              />
            ) : (
              <SessionStatusTable
                sessions={sessions.data}
                summaries={summary.data?.sessions ?? null}
              />
            )}
          </div>
        ) : (
          <SectionLoading />
        )}
      </Section>

      <Section title="최근 실시간 접수 동향">
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
