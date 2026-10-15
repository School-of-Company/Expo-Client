'use client';

import { useMemo } from 'react';
import { MockDataBadge } from '@/shared/ui';
import {
  formatDateTime,
  maskPhoneNumber,
  RegistrationTable,
  StatusBadge,
  StatusBadgeTone,
  TableColumn,
} from '../../../common';
import { AdminApplicationStatus } from '../../../common/api/ledgerApi';
import {
  formatDefinitionSchedule,
  LEDGER_STATUS_LABEL,
  LedgerRow,
  OCCUPATION_LABEL,
} from '../../../common/model/ledger';
import {
  APPLICATION_META_ISSUE,
  ApplicationMeta,
  getApplicationMeta,
} from '../../mock/applicationMeta';

type RecentLedgerRow = LedgerRow & { meta: ApplicationMeta };

const STATUS_TONE: Record<AdminApplicationStatus, StatusBadgeTone> = {
  CONFIRMED: 'main',
  WAITING: 'outline',
  CANCELLED: 'error',
};

const COLUMNS: TableColumn<RecentLedgerRow>[] = [
  {
    key: 'receiptNumber',
    label: '접수번호',
    flex: 0.7,
    render: ({ meta }) => meta.receiptNumber,
  },
  {
    key: 'participant',
    label: '참가자',
    render: ({ name, phoneNumber }) => (
      <>
        <p className="truncate text-black">{name}</p>
        <p className="text-caption2r">
          {phoneNumber ? maskPhoneNumber(phoneNumber) : '-'}
        </p>
      </>
    ),
  },
  {
    key: 'affiliation',
    label: '구분 / 소속',
    flex: 1.2,
    render: ({ occupation, meta }) => (
      <>
        <p>{occupation ? OCCUPATION_LABEL[occupation] : '-'}</p>
        <p className="truncate text-caption2r">{meta.affiliation}</p>
      </>
    ),
  },
  {
    key: 'program',
    label: '신청 프로그램',
    flex: 2,
    render: ({ title, startedAt, endedAt }) => (
      <>
        <p className="truncate text-black">{title}</p>
        <p className="text-caption2r">
          {formatDefinitionSchedule(startedAt, endedAt)}
        </p>
      </>
    ),
  },
  {
    key: 'channel',
    label: '채널',
    flex: 0.6,
    render: ({ meta }) => meta.channel,
  },
  {
    key: 'status',
    label: '상태',
    flex: 0.6,
    render: ({ status }) => (
      <StatusBadge tone={STATUS_TONE[status]}>
        {LEDGER_STATUS_LABEL[status]}
      </StatusBadge>
    ),
  },
  {
    key: 'createdAt',
    label: '신청 일시',
    render: ({ createdAt }) => formatDateTime(createdAt),
  },
];

/** 최근 접수. 접수번호·소속·채널은 원장에 아직 없어 예시 값이다 */
const RecentLedgerTable = ({ rows }: { rows: LedgerRow[] }) => {
  const tableRows = useMemo(
    () =>
      rows.map((row, index) => ({ ...row, meta: getApplicationMeta(index) })),
    [rows],
  );

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center gap-8">
        <p className="text-caption1r text-gray-400">
          접수번호·소속·채널은 서버 연결 전 예시 값입니다.
        </p>
        <MockDataBadge issue={APPLICATION_META_ISSUE} />
      </div>
      <RegistrationTable
        columns={COLUMNS}
        rows={tableRows}
        emptyText="아직 신청이 없습니다."
        footerText="최근 신청"
        footerCount={tableRows.length}
        maxHeight="none"
        minWidth="960px"
      />
    </>
  );
};

export default RecentLedgerTable;
