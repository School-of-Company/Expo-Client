'use client';

import { RegistrationTable, SectionError, TableColumn } from '../../../common';
import { AdminApplicationStatus } from '../../../common/api/ledgerApi';
import {
  LEDGER_STATUS_LABEL,
  LEDGER_STATUS_STYLE,
  PROGRAM_TYPE_LABEL,
} from '../../../common/model/ledger';
import { AdminApplicationActivity } from '../../api/applicationActivityApi';
import { formatOccurredAt } from '../../model/adminChangeHistory';
import {
  getActivityActionLabel,
  getActivityActionStyle,
  getActivityErrorMessage,
  useAdminApplicationActivities,
} from '../../model/applicationActivity';
import LoadMoreButton from '../LoadMoreButton';

const isLedgerStatus = (status: string): status is AdminApplicationStatus =>
  status in LEDGER_STATUS_LABEL;

const COLUMNS: TableColumn<AdminApplicationActivity>[] = [
  {
    key: 'createdAt',
    label: '처리 일시',
    flex: 1.4,
    render: ({ createdAt }) => formatOccurredAt(createdAt),
  },
  {
    key: 'action',
    label: '유형',
    render: ({ action }) => (
      <span className={getActivityActionStyle(action)}>
        {getActivityActionLabel(action)}
      </span>
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
  {
    key: 'program',
    label: '프로그램',
    render: ({ programType, programId }) =>
      `${PROGRAM_TYPE_LABEL[programType] ?? programType} #${programId}`,
  },
  {
    key: 'applicationId',
    label: '신청',
    flex: 1.4,
    render: ({ applicationId, participantId }) => (
      <div title={`신청 ${applicationId}`}>
        <p>참가자 #{participantId}</p>
        <p className="break-all text-caption1r text-gray-400">
          {applicationId.slice(0, 8)}
        </p>
      </div>
    ),
  },
  {
    key: 'actorId',
    label: '처리자',
    render: ({ actorId }) =>
      actorId === null ? (
        <span className="text-gray-300">신청자·자동</span>
      ) : (
        `관리자 #${actorId}`
      ),
  },
];

interface ApplicationActivitySectionProps {
  expoId: string;
}

const ApplicationActivitySection = ({
  expoId,
}: ApplicationActivitySectionProps) => {
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
  } = useAdminApplicationActivities(expoId);

  return (
    <section className="space-y-16">
      <div className="space-y-6">
        <p className="text-body1b text-black">신청·취소·승급 이력</p>
        <p className="text-caption1r text-gray-400">
          프로그램 신청·취소·대기 승급 처리 이력입니다. 처리자는 관리자 취소만
          기록합니다.
        </p>
      </div>

      {isError && !data ? (
        <SectionError
          message={getActivityErrorMessage(error)}
          onRetry={() => refetch()}
        />
      ) : (
        <RegistrationTable
          columns={COLUMNS}
          rows={data?.items ?? []}
          emptyText={
            isPending ? '불러오는 중입니다.' : '신청 처리 이력이 없습니다.'
          }
          footerText="신청 처리 이력"
          footerCount={data?.totalElements ?? 0}
          minWidth="900px"
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
