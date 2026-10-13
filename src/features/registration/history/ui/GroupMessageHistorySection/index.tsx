'use client';

import { JOB_STATUS_LABEL } from '../../../applications/model/groupMessage';
import { RegistrationTable, SectionError, TableColumn } from '../../../common';
import { GroupMessageJobStatus } from '../../../common/api/groupMessageApi';
import { PROGRAM_TYPE_LABEL } from '../../../common/model/ledger';
import { formatOccurredAt } from '../../model/adminChangeHistory';
import {
  getMessageHistoryErrorMessage,
  getMessageHistoryTypeLabel,
  getMessageHistoryTypeStyle,
  MessageHistoryRow,
  useAdminMessageHistory,
} from '../../model/groupMessageHistory';
import LoadMoreButton from '../LoadMoreButton';

const getJobStatusLabel = (status: string) =>
  JOB_STATUS_LABEL[status as GroupMessageJobStatus] ?? status;

const COLUMNS: TableColumn<MessageHistoryRow>[] = [
  {
    key: 'occurredAt',
    label: '처리 일시',
    flex: 1.4,
    render: ({ occurredAt }) => formatOccurredAt(occurredAt),
  },
  {
    key: 'type',
    label: '유형',
    render: ({ type }) => (
      <span className={getMessageHistoryTypeStyle(type)}>
        {getMessageHistoryTypeLabel(type)}
      </span>
    ),
  },
  {
    key: 'target',
    label: '대상',
    flex: 1.4,
    render: ({ targetScope: { applicationCount, programTypes } }) => {
      const programs = programTypes
        .map((type) => PROGRAM_TYPE_LABEL[type] ?? type)
        .join('·');
      const count =
        applicationCount === null ? '신청 수 미기록' : `${applicationCount}건`;
      return programs ? `${programs} ${count}` : count;
    },
  },
  {
    key: 'counts',
    label: '발송 결과 (당시)',
    flex: 2.4,
    render: ({ counts }) => (
      <p className="break-words">
        전체 {counts.total} · 도착 {counts.delivered} · 접수 {counts.accepted} ·
        대기 {counts.pending}
        {counts.failed > 0 && (
          <span className="text-error"> · 실패 {counts.failed}</span>
        )}
        {counts.unknown > 0 && ` · 결과 불명 ${counts.unknown}`}
        {counts.missing > 0 && ` · 누락 ${counts.missing}`}
      </p>
    ),
  },
  {
    key: 'status',
    label: '작업 상태 (당시)',
    render: ({ status }) => getJobStatusLabel(status),
  },
  {
    key: 'adminId',
    label: '요청 관리자',
    render: ({ adminId }) => `관리자 #${adminId}`,
  },
];

interface GroupMessageHistorySectionProps {
  expoId: string;
}

const GroupMessageHistorySection = ({
  expoId,
}: GroupMessageHistorySectionProps) => {
  const {
    data: rows,
    error,
    isPending,
    isError,
    isFetchNextPageError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = useAdminMessageHistory(expoId);

  return (
    <section className="space-y-16">
      <div className="space-y-6">
        <p className="text-body1b text-black">그룹 문자 발송 이력</p>
        <p className="text-caption1r text-gray-400">
          그룹 문자 작업의 요청·종료·재발송 이력입니다. 결과와 상태는 이력이
          남은 시점의 값이며, 본문과 전화번호는 보관하지 않습니다.
        </p>
      </div>

      {isError && !rows ? (
        <SectionError
          message={getMessageHistoryErrorMessage(error)}
          onRetry={() => refetch()}
        />
      ) : (
        <RegistrationTable
          columns={COLUMNS}
          rows={rows ?? []}
          emptyText={
            isPending ? '불러오는 중입니다.' : '문자 발송 이력이 없습니다.'
          }
          footerText={hasNextPage ? '불러온 발송 이력' : '발송 이력'}
          footerCount={rows?.length ?? 0}
          minWidth="1000px"
        >
          {isError ? (
            <SectionError
              message={getMessageHistoryErrorMessage(error)}
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

export default GroupMessageHistorySection;
