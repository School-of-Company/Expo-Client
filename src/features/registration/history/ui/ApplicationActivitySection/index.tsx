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
  formatDefinitionSchedule,
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
  getActivityActorLabel,
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

const renderStatus = (status: string) =>
  isLedgerStatus(status) ? (
    <span className={LEDGER_STATUS_STYLE[status]}>
      {LEDGER_STATUS_LABEL[status]}
    </span>
  ) : (
    status
  );

/** 표에 그리는 행. currentTitle 은 현재 회차 목록의 제목이다 */
interface ActivityRow extends AdminApplicationActivity {
  currentTitle: string | null;
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
    label: '대상 참가자',
    // 서버 participant 는 현재 User 정보라 처리 당시 값과 다를 수 있다
    render: ({ participantId, participant }) => (
      <div>
        <p className="break-words text-black">
          {participant?.name ?? `참가자 #${participantId}`}
        </p>
        <p className="text-caption1r text-gray-400">
          #{participantId} · {participant ? '현재 정보' : '정보 없음'}
        </p>
      </div>
    ),
  },
  {
    key: 'program',
    label: '프로그램',
    flex: 1.6,
    // definition 은 제출 당시 스냅샷이다. 누락 필드는 서버가 채우지 않으므로 현재 회차로 보완한다
    render: ({ programType, programId, definition, currentTitle }) => (
      <div>
        <p className="break-words text-black">
          {definition?.title ?? currentTitle ?? `프로그램 #${programId}`}
        </p>
        <p className="text-caption1r text-gray-400">
          {PROGRAM_TYPE_LABEL[programType] ?? programType}
          {definition?.startedAt &&
            ` · ${formatDefinitionSchedule(definition.startedAt, definition.endedAt ?? null)}`}
          {definition?.title
            ? ' · 제출 당시'
            : currentTitle
              ? ' · 현재 정보'
              : ' · 삭제됨 또는 미기록'}
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
    label: '처리자',
    render: (row) => (
      <p
        className={
          !row.actorType || row.actorType === 'UNKNOWN'
            ? 'text-gray-300'
            : undefined
        }
      >
        {getActivityActorLabel(row)}
      </p>
    ),
  },
  {
    key: 'status',
    label: '변경 전 → 후',
    flex: 1.4,
    render: ({ status, previousStatus, previousStatusRecorded }) => {
      // 상태를 화면에서 추정하지 않는다. 서버가 준 값만 보여 준다
      let before: React.ReactNode = '미기록';
      if (previousStatus) before = renderStatus(previousStatus);
      else if (previousStatusRecorded) before = '없음(신규)';
      return (
        <p>
          {before} → {renderStatus(status)}
        </p>
      );
    },
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
        currentTitle:
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
      </div>

      <ApplicationActivityFilters
        filter={filter}
        sessions={sessions ?? []}
        onChange={setFilter}
      />

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
