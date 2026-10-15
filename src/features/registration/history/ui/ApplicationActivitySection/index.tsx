'use client';

import { useMemo, useState } from 'react';
import {
  RegistrationTable,
  SectionError,
  StatCard,
  StatusBadge,
  TableColumn,
} from '../../../common';
import { AdminApplicationStatus } from '../../../common/api/ledgerApi';
import {
  LEDGER_STATUS_LABEL,
  LEDGER_STATUS_STYLE,
  PROGRAM_TYPE_LABEL,
  toSessionKey,
  useCurrentSessions,
} from '../../../common/model/ledger';
import { AdminApplicationActivity } from '../../api/applicationActivityApi';
import { formatOccurredAt } from '../../model/adminChangeHistory';
import {
  ActivityFilter,
  getActivityActionLabel,
  getActivityActionTone,
  getActivityErrorMessage,
  INITIAL_ACTIVITY_FILTER,
  isActivityRangeInvalid,
  useActivityCounts,
  useAdminApplicationActivities,
} from '../../model/applicationActivity';
import ApplicationActivityFilters from '../ApplicationActivityFilters';
import LoadMoreButton from '../LoadMoreButton';

const isLedgerStatus = (status: string): status is AdminApplicationStatus =>
  status in LEDGER_STATUS_LABEL;

/** 표에 그리는 행 */
interface ActivityRow extends AdminApplicationActivity {
  programTitle: string | null;
}

const COLUMNS: TableColumn<ActivityRow>[] = [
  {
    key: 'id',
    label: '로그번호',
    flex: 0.8,
    render: ({ id }) => `#${id}`,
  },
  {
    key: 'createdAt',
    label: '처리일시',
    flex: 1.4,
    render: ({ createdAt }) => formatOccurredAt(createdAt),
  },
  {
    key: 'application',
    label: '신청',
    render: ({ applicationId }) => (
      <p title={`신청 ${applicationId}`} className="break-all text-caption1r">
        {applicationId.slice(0, 8)}
      </p>
    ),
  },
  {
    key: 'participant',
    label: '참가자',
    render: ({ participantId }) => `참가자 #${participantId}`,
  },
  {
    key: 'program',
    label: '프로그램',
    flex: 1.6,
    render: ({ programType, programId, programTitle }) => (
      <div>
        <p className="break-words text-black">
          {programTitle ?? `프로그램 #${programId}`}
        </p>
        <p className="text-caption1r text-gray-400">
          {PROGRAM_TYPE_LABEL[programType] ?? programType}
        </p>
      </div>
    ),
  },
  {
    key: 'action',
    label: '처리유형',
    render: ({ action }) => (
      <StatusBadge tone={getActivityActionTone(action)}>
        {getActivityActionLabel(action)}
      </StatusBadge>
    ),
  },
  {
    key: 'actor',
    label: '처리주체',
    // 관리자 처리만 actorId 가 남고, 사용자·자동 처리는 서버가 구분하지 않는다
    render: ({ actorId }) =>
      actorId === null ? (
        <p className="text-gray-300">사용자·자동</p>
      ) : (
        <p>관리자 #{actorId}</p>
      ),
  },
  {
    key: 'status',
    label: '처리 후 상태',
    render: ({ status }) =>
      isLedgerStatus(status) ? (
        <span className={LEDGER_STATUS_STYLE[status]}>
          {LEDGER_STATUS_LABEL[status]}
        </span>
      ) : (
        status
      ),
  },
];

interface ApplicationActivitySectionProps {
  expoId: string;
}

const ApplicationActivitySection = ({
  expoId,
}: ApplicationActivitySectionProps) => {
  const [filter, setFilter] = useState<ActivityFilter>(INITIAL_ACTIVITY_FILTER);
  const isRangeInvalid = isActivityRangeInvalid(filter);
  const {
    data,
    error,
    isPending,
    isError,
    isFetchNextPageError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = useAdminApplicationActivities(expoId, filter);
  const counts = useActivityCounts(expoId, filter);
  const { data: sessions } = useCurrentSessions(expoId);

  // 삭제된 프로그램은 현재 회차에 없어 유형·번호로 보여 준다
  const titleByKey = useMemo(
    () =>
      new Map(
        (sessions ?? []).map((session) => [
          toSessionKey(session),
          session.title,
        ]),
      ),
    [sessions],
  );

  const items = useMemo(() => data?.items ?? [], [data]);
  const rows = useMemo<ActivityRow[]>(
    () =>
      items.map((item) => ({
        ...item,
        programTitle:
          titleByKey.get(
            toSessionKey({ programType: item.programType, id: item.programId }),
          ) ?? null,
      })),
    [items, titleByKey],
  );

  const formatCount = (value: number | undefined) =>
    value === undefined ? '-' : value.toLocaleString();

  return (
    <section className="space-y-16">
      <div className="space-y-6">
        <p className="text-body1b text-black">신청·취소·승급 이력</p>
        <p className="text-caption1r text-gray-400">
          신청·취소·대기 승급 등 상태 변화를 시간순으로 조회합니다.
        </p>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-4 gap-12 mobile:grid-cols-2">
          <StatCard
            label="전체 이력"
            value={formatCount(counts?.total)}
            unit="건"
            emphasis
          />
          <StatCard
            label="신청"
            value={formatCount(counts?.APPLIED)}
            unit="건"
          />
          <StatCard
            label="취소"
            value={formatCount(counts?.CANCELLED)}
            unit="건"
          />
          <StatCard
            label="승급"
            value={formatCount(counts?.PROMOTED)}
            unit="건"
          />
        </div>
        <p className="text-caption1r text-gray-400">
          처리일 조건을 반영한 건수입니다. 처리유형 조건과 상관없이 유형별로
          나눠 보여 줍니다.
        </p>
      </div>

      <ApplicationActivityFilters filter={filter} onChange={setFilter} />

      {isRangeInvalid ? (
        <p role="alert" className="text-body2r text-error">
          시작 일시는 종료 일시보다 앞서야 합니다.
        </p>
      ) : isError && !data ? (
        <SectionError
          message={getActivityErrorMessage(error)}
          onRetry={() => refetch()}
        />
      ) : (
        <RegistrationTable
          columns={COLUMNS}
          rows={rows}
          emptyText={
            isPending
              ? '불러오는 중입니다.'
              : '조건에 맞는 처리 이력이 없습니다.'
          }
          footerText="신청 처리 이력"
          footerCount={data?.totalElements ?? 0}
          minWidth="1000px"
        >
          {isError ? (
            <SectionError
              message={getActivityErrorMessage(error)}
              onRetry={() =>
                isFetchNextPageError ? fetchNextPage() : refetch()
              }
            />
          ) : (
            hasNextPage && (
              <LoadMoreButton
                isLoading={isFetchingNextPage}
                onClick={() => fetchNextPage()}
              />
            )
          )}
        </RegistrationTable>
      )}
    </section>
  );
};

export default ApplicationActivitySection;
