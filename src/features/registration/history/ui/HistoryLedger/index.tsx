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
import ApplicationActivitySection from '../ApplicationActivitySection';
import GroupMessageHistorySection from '../GroupMessageHistorySection';
import HistoryFilters from '../HistoryFilters';

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
    render: ({ targetType, targetId }) => (
      // 매핑이 없는 유형은 PREREGISTER_SESSION 처럼 공백 없는 긴 원문이라 칸 안에서 줄바꿈한다
      <p className="break-words">
        {getTargetTypeLabel(targetType)} #{targetId}
      </p>
    ),
  },
  {
    key: 'summary',
    label: '내용',
    flex: 3,
    render: ({ summary }) => <p className="break-words">{summary || '-'}</p>,
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
  const { expoId, routes } = useRegistrationExpo();
  const [filter, setFilter] = useState<HistoryFilter>(INITIAL_HISTORY_FILTER);

  const { data, error, isLoading, isError, refetch } = useAdminChangeHistory(
    expoId,
    filter,
    page - 1,
  );
  const isRangeInvalid = isHistoryRangeInvalid(filter);
  const totalCount = data?.totalElements ?? 0;
  const totalPage = getHistoryTotalPage(totalCount);

  const handleFilterChange = useCallback(
    (next: HistoryFilter) => {
      setFilter(next);
      // 1페이지로 돌아갈 때만 주소를 바꾼다. 매번 바꾸면 라우터가 서버에 화면을 다시 요청한다
      if (searchParams.get('page')) router.replace('?');
    },
    [router, searchParams],
  );

  return withLoading({
    isLoading: isLoading && !data,
    children: (
      <div className="flex w-full min-w-0 max-w-[1200px] flex-1 flex-col space-y-[54px]">
        <DetailHeader
          textCenter
          headerTitle="행정 이력"
          onBack={() => router.push(routes.dashboard)}
        />

        <ApplicationActivitySection expoId={expoId} />

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

        <GroupMessageHistorySection expoId={expoId} />
      </div>
    ),
  });
};

export default HistoryLedger;
