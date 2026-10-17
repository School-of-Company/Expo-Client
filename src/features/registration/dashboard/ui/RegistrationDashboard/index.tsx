'use client';

import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { ReactNode, useMemo, useState } from 'react';
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
  getSummaryErrorMessage,
  LEDGER_REFRESH_MS,
  useCurrentSessions,
  useLedgerSummary,
} from '../../../common/model/ledger';
import {
  preregisterSummaryQueryKey,
  usePreregisterSummary,
} from '../../../common/model/preregisterSummary';
import { activeQrQueryKey } from '../../model/activeQr';
import { applicationPageViewsQueryKey } from '../../model/applicationPageViews';
import {
  countSessionsByRecruitment,
  groupSessionsByProgram,
} from '../../model/programGroups';
import MonitoringCards from '../MonitoringCards';
import PreregisterBanner from '../PreregisterBanner';
import PreregisterSessionTable from '../PreregisterSessionTable';
import ProgramStatusTable from '../ProgramStatusTable';
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

/** 보는 정보는 이 화면에 모으고, 입력·발송·인쇄 같은 작업은 각 화면으로 보낸다. 최근 신청·처리 이력은 접수대장·행정 이력 탭에서 본다 */
const RegistrationDashboard = () => {
  const queryClient = useQueryClient();
  const { expoId, routes } = useRegistrationExpo();
  const [programView, setProgramView] = useState<ProgramView>('program');
  // 각 영역은 따로 조회해서 하나가 실패해도 나머지는 보여 준다
  const summary = useLedgerSummary(expoId);
  const sessions = useCurrentSessions(expoId);
  const preregister = usePreregisterSummary(expoId);
  // 사전등록 회차 이름·일시와 Expo 대기 정원. 실패해도 회차 번호로 집계를 보여 준다
  const preregisterSessions = usePreregisterSessions(expoId);
  const queries = [summary, sessions, preregister];

  const updatedAt = Math.max(
    ...queries.map(({ dataUpdatedAt }) => dataUpdatedAt),
  );
  const isFetching = queries.some(({ isFetching }) => isFetching);
  const handleRefresh = () =>
    Promise.all(
      [
        ['adminApplicationSummary', expoId],
        ['adminCurrentSessions', expoId],
        preregisterSummaryQueryKey(expoId),
        scheduleQueryKeys.sessions(expoId),
        applicationPageViewsQueryKey(expoId),
        activeQrQueryKey(expoId),
      ].map((queryKey) => queryClient.invalidateQueries({ queryKey })),
    );

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
    <div className="flex w-full max-w-[1200px] flex-1 flex-col space-y-30 overflow-y-auto">
      <div className="space-y-12">
        {/* 박람회 이름은 위쪽 모니터링 머리에 있어 갱신 상태만 둔다 */}
        <div className="flex justify-end">
          <RefreshStatus
            updatedAt={updatedAt}
            isFetching={isFetching}
            onRefresh={handleRefresh}
            intervalMs={LEDGER_REFRESH_MS}
            hasError={queries.some(({ isError }) => isError)}
          />
        </div>
        {/* 신청 요약 4개와 운영 지표 4개를 한 덩어리로 두어 한 화면에 보이게 한다 */}
        <div className="grid grid-cols-4 gap-12 mobile:grid-cols-1 tablet:grid-cols-2">
          <SummaryCards
            programCount={programCount}
            sessionCount={sessions.data?.length ?? null}
            confirmed={summary.data ? (counts?.CONFIRMED ?? 0) : null}
            waiting={summary.data ? (counts?.WAITING ?? 0) : null}
            uniqueParticipants={summary.data?.uniqueParticipants ?? null}
          />
          <MonitoringCards expoId={expoId} sessionCounts={sessionCounts} />
        </div>
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

      <Section
        title="프로그램별 신청 현황"
        description="프로그램 회차 신청 기준입니다. 회차별 상세에서 행을 누르면 그 회차의 접수 관리대장으로 이동합니다."
        href={routes.applications}
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
          preregister.data && <PreregisterBanner summary={preregister.data} />
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
              <details className="rounded-sm bg-gray-100 px-16 py-8">
                <summary className="cursor-pointer text-caption1b text-gray-600">
                  집계 기준
                </summary>
                <p className="pt-6 text-caption1r text-gray-500">
                  행사 사전등록 기준 고유 인원입니다. 대표자와 동행자를 각각 한
                  명으로 세며, 대기는 확정 전 일행 기준입니다. 선두 일행이 빈
                  확정석보다 많으면 순서대로 승급하기 위해 대기 승급이 멈춥니다.
                  대기 정원이 미적용인 회차는 대기를 받지 않으므로 현재 회차
                  대기 정원을 적용해야 합니다.
                </p>
              </details>
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
    </div>
  );
};

export default RegistrationDashboard;
