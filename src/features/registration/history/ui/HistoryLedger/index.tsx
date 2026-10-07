'use client';

import { useMemo, useState } from 'react';
import { withLoading } from '@/shared/hocs';
import {
  RegistrationHistory,
  RegistrationHistoryAction,
} from '@/shared/types/registration/type';
import { DetailHeader } from '@/shared/ui';
import SelectUserType from '@/shared/ui/SelectUserType';
import {
  formatDateTime,
  HISTORY_ACTION_LABEL,
  RegistrationTable,
  TableColumn,
  useRegistrationHistories,
} from '../../../common';

const ACTION_OPTIONS = [
  { value: '', label: '전체 이력' },
  ...Object.entries(HISTORY_ACTION_LABEL).map(([value, label]) => ({
    value,
    label,
  })),
];

const COLUMNS: TableColumn<RegistrationHistory>[] = [
  { key: 'id', label: '번호', flex: 0.5, render: (history) => history.id },
  {
    key: 'action',
    label: '구분',
    flex: 0.8,
    render: (history) => (
      <span className="text-main-600">
        {HISTORY_ACTION_LABEL[history.action]}
      </span>
    ),
  },
  {
    key: 'summary',
    label: '내용',
    flex: 3,
    render: (history) => (
      <p className="truncate text-left text-black">{history.summary}</p>
    ),
  },
  {
    key: 'actor',
    label: '처리자',
    flex: 0.7,
    render: (history) => history.actor,
  },
  {
    key: 'createdAt',
    label: '일시',
    render: (history) => formatDateTime(history.createdAt),
  },
];

const HistoryLedger = () => {
  const { data, isLoading } = useRegistrationHistories();
  const [action, setAction] = useState('');

  const histories = useMemo(
    () =>
      (data ?? []).filter(
        (history) =>
          !action || history.action === (action as RegistrationHistoryAction),
      ),
    [data, action],
  );

  return withLoading({
    isLoading: isLoading || !data,
    children: (
      <div className="flex w-full max-w-[1200px] flex-1 flex-col space-y-[54px] overflow-y-auto">
        <DetailHeader textCenter headerTitle="행정 이력" />
        <SelectUserType
          options={ACTION_OPTIONS}
          value={action}
          onChange={setAction}
        />
        <RegistrationTable
          columns={COLUMNS}
          rows={histories}
          emptyText="기록된 이력이 없습니다."
          footerText="이력"
          footerCount={histories.length}
          maxHeight="700px"
        />
      </div>
    ),
  });
};

export default HistoryLedger;
