'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import { withLoading } from '@/shared/hocs';
import { DetailHeader, NavigationBar } from '@/shared/ui';
import {
  RegistrationTable,
  SectionError,
  TableColumn,
  useRegistrationExpo,
} from '../../../common';
import { AdminChangeHistoryItem } from '../../api/adminChangeHistoryApi';
import { GroupMessageHistoryItem } from '../../api/groupMessageHistoryApi';
import {
  formatOccurredAt,
  getChangeTypeLabel,
  getChangeTypeStyle,
  getHistoryErrorMessage,
  getHistoryTotalPage,
  getTargetTypeLabel,
  HistoryFilter,
  INITIAL_HISTORY_FILTER,
  isHistoryRangeInvalid,
  useAdminChangeHistory,
} from '../../model/adminChangeHistory';
import {
  getMessageHistoryErrorMessage,
  getMessageTypeLabel,
  useGroupMessageHistory,
} from '../../model/groupMessageHistory';
import HistoryFilters from '../HistoryFilters';

// 신청 이력은 공개 조회 API가 생기기 전까지 임시 이력을 보여 주지 않는다
const PENDING_SOURCES = [
  {
    title: '신청·취소·승급 이력',
    source: 'Application',
    status: '공개 관리자 조회 API 구현 중 (Expo-Application-Server#93)',
  },
];

type MessageRow = GroupMessageHistoryItem & { id: string };

const MESSAGE_COLUMNS: TableColumn<MessageRow>[] = [
  {
    key: 'occurredAt',
    label: '처리 일시',
    flex: 1.4,
    render: ({ occurredAt }) => formatOccurredAt(occurredAt),
  },
  {
    key: 'type',
    label: '유형',
    render: ({ type }) => getMessageTypeLabel(type),
  },
  {
    key: 'target',
    label: '대상',
    flex: 1.6,
    render: ({ targetScope: { kind, applicationCount } }) =>
      applicationCount === null ? kind : `${kind} · 신청 ${applicationCount}건`,
  },
  {
    key: 'counts',
    label: '결과',
    flex: 2,
    render: ({ counts }) =>
      `전체 ${counts.total} · 전달 ${counts.delivered} · 실패 ${counts.failed} · 미확인 ${counts.unknown} · 누락 ${counts.missing}`,
  },
  { key: 'status', label: '상태', render: ({ status }) => status },
  {
    key: 'adminId',
    label: '처리자',
    render: ({ adminId }) => `관리자 #${adminId}`,
  },
];

const COLUMNS: TableColumn<AdminChangeHistoryItem>[] = [
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
      <span className={getChangeTypeStyle(type)}>
        {getChangeTypeLabel(type)}
      </span>
    ),
  },
  {
    key: 'target',
    label: '대상',
    render: ({ targetType, targetId }) =>
      `${getTargetTypeLabel(targetType)} #${targetId}`,
  },
  {
    key: 'summary',
    label: '내용',
    flex: 3,
    render: ({ summary }) => (
      <p className="break-words text-left">{summary || '-'}</p>
    ),
  },
  {
    key: 'adminId',
    label: '처리자',
    render: ({ adminId }) =>
      adminId === null ? (
        <span className="text-gray-300">미기록</span>
      ) : (
        `관리자 #${adminId}`
      ),
  },
];

const HistoryLedger = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  // URL 의 ?page 는 1부터, 서버 페이지는 0부터
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const { expoId } = useRegistrationExpo();
  const [filter, setFilter] = useState<HistoryFilter>(INITIAL_HISTORY_FILTER);

  const { data, error, isLoading, isError, refetch } = useAdminChangeHistory(
    expoId,
    filter,
    page - 1,
  );
  const isRangeInvalid = isHistoryRangeInvalid(filter);
  const message = useGroupMessageHistory(expoId, filter, !isRangeInvalid);
  const messageRows: MessageRow[] = (message.data?.pages ?? [])
    .flatMap(({ items }) => items)
    .map((item) => ({ ...item, id: item.eventId }));
  const totalCount = data?.totalElements ?? 0;
  const totalPage = getHistoryTotalPage(totalCount);

  const handleFilterChange = useCallback(
    (next: HistoryFilter) => {
      setFilter(next);
      router.replace('?');
    },
    [router],
  );

  return withLoading({
    isLoading: isLoading && !data,
    children: (
      <div className="flex w-full max-w-[1200px] flex-1 flex-col space-y-[54px]">
        <DetailHeader textCenter headerTitle="행정 이력" />

        <section className="space-y-16">
          <div className="space-y-6">
            <p className="text-body1b text-black">모집 변경 이력</p>
            <p className="text-caption1r text-gray-400">
              프로그램·회차 생성·수정·삭제 처리 이력입니다. 기록 이전의 변경은
              포함하지 않습니다.
            </p>
          </div>

          <HistoryFilters
            filter={filter}
            onChange={handleFilterChange}
            onReset={() => handleFilterChange(INITIAL_HISTORY_FILTER)}
          />

          {isRangeInvalid ? (
            <p role="alert" className="text-body2r text-error">
              시작 일시는 종료 일시보다 앞서야 합니다.
            </p>
          ) : isError && !data ? (
            <SectionError
              message={getHistoryErrorMessage(error)}
              onRetry={() => refetch()}
            />
          ) : (
            <RegistrationTable
              columns={COLUMNS}
              rows={data?.items ?? []}
              emptyText="조건에 맞는 변경 이력이 없습니다."
              footerText="변경 이력"
              footerCount={totalCount}
              minWidth="900px"
            >
              {totalPage > 1 && (
                <div className="flex justify-center">
                  <NavigationBar totalPage={totalPage} />
                </div>
              )}
            </RegistrationTable>
          )}
        </section>

        <section className="space-y-16">
          <div className="space-y-6">
            <p className="text-body1b text-black">그룹 문자 발송 이력</p>
            <p className="text-caption1r text-gray-400">
              Notification 원천의 처리 이력입니다. 위 기간(시작 포함·종료
              미포함)만 적용되며 본문·전화번호는 표시하지 않습니다.
            </p>
          </div>

          {isRangeInvalid ? null : message.isError && !message.data ? (
            <SectionError
              message={getMessageHistoryErrorMessage(message.error)}
              onRetry={() => message.refetch()}
            />
          ) : (
            <RegistrationTable
              columns={MESSAGE_COLUMNS}
              rows={messageRows}
              emptyText="조건에 맞는 문자 발송 이력이 없습니다."
              footerText="불러온 문자 이력"
              footerCount={messageRows.length}
              minWidth="900px"
            >
              {message.isError && (
                <SectionError
                  message={getMessageHistoryErrorMessage(message.error)}
                  onRetry={() => message.fetchNextPage()}
                />
              )}
              {message.hasNextPage && (
                <div className="flex justify-center">
                  <button
                    type="button"
                    disabled={message.isFetchingNextPage}
                    onClick={() => message.fetchNextPage()}
                    className="text-body2r text-main-600 underline"
                  >
                    {message.isFetchingNextPage ? '불러오는 중...' : '더 보기'}
                  </button>
                </div>
              )}
            </RegistrationTable>
          )}
        </section>

        <ul className="space-y-12 rounded-sm border-1 border-solid border-gray-200 px-30 py-20 mobile:px-16">
          {PENDING_SOURCES.map(({ title, source, status }) => (
            <li key={title} className="flex flex-wrap items-baseline gap-12">
              <span className="text-body2b text-black">{title}</span>
              <span className="text-caption1r text-gray-400">{source}</span>
              <span className="text-caption1r text-gray-500">{status}</span>
            </li>
          ))}
        </ul>
      </div>
    ),
  });
};

export default HistoryLedger;
