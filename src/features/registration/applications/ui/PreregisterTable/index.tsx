import { ReactNode } from 'react';
import {
  formatDateTime,
  RegistrationTable,
  StatusBadge,
  TableColumn,
} from '../../../common';
import { OCCUPATION_LABEL } from '../../../common/model/ledger';
import {
  PREREGISTER_STATUS_LABEL,
  PreregisterRelation,
  PreregisterRow,
} from '../../../common/model/preregisterLedger';
import { PREREGISTER_STATUS_TONE } from '../../model/ledgerView';

const RELATION_LABEL: Record<PreregisterRelation, string> = {
  REPRESENTATIVE: '대표자',
  COMPANION: '동행자',
  PARTY: '대기 일행',
};

interface PreregisterTableProps {
  rows: PreregisterRow[];
  totalCount: number;
  /** 회차 ID → 표시 이름 */
  sessionLabel: (sessionId: number) => string;
  onRowClick: (row: PreregisterRow) => void;
  children: ReactNode;
}

const PreregisterTable = ({
  rows,
  totalCount,
  sessionLabel,
  onRowClick,
  children,
}: PreregisterTableProps) => {
  const columns: TableColumn<PreregisterRow>[] = [
    {
      key: 'name',
      label: '이름',
      flex: 1.2,
      render: ({ name, relation, applicants }) => (
        <>
          <p className="truncate text-black">{name ?? '-'}</p>
          <p className="text-caption2r">
            {RELATION_LABEL[relation]}
            {/* 예약 행은 일행 인원, 참가자 행은 항상 1명이라 표시하지 않는다 */}
            {relation === 'PARTY' && ` · ${applicants}명`}
          </p>
        </>
      ),
    },
    {
      key: 'phone',
      label: '연락처',
      flex: 1.2,
      render: ({ phoneNumber }) => (
        <p className={phoneNumber ? 'text-black' : 'text-gray-300'}>
          {phoneNumber ?? '번호 없음'}
        </p>
      ),
    },
    {
      key: 'occupation',
      label: '직업',
      flex: 1,
      render: ({ occupation }) => (
        <p className="truncate text-black">
          {occupation ? OCCUPATION_LABEL[occupation] : '-'}
        </p>
      ),
    },
    {
      key: 'session',
      label: '회차',
      flex: 1.6,
      render: ({ sessionId }) => (
        <p className="truncate text-black">{sessionLabel(sessionId)}</p>
      ),
    },
    {
      key: 'createdAt',
      label: '신청일시',
      flex: 1.1,
      // 대기 예약은 생성 시각이 없다
      render: ({ createdAt }) => (
        <p className={`text-caption1r ${createdAt ? '' : 'text-gray-300'}`}>
          {createdAt ? formatDateTime(createdAt) : '기록 없음'}
        </p>
      ),
    },
    {
      key: 'status',
      label: '상태',
      flex: 0.9,
      render: ({ status }) => (
        <StatusBadge tone={PREREGISTER_STATUS_TONE[status]}>
          {PREREGISTER_STATUS_LABEL[status]}
        </StatusBadge>
      ),
    },
  ];

  return (
    <RegistrationTable
      columns={columns}
      rows={rows}
      emptyText="조건에 맞는 사전등록 신청이 없습니다."
      footerText="검색 결과(행)"
      footerCount={totalCount}
      maxHeight="none"
      minWidth="900px"
      onRowClick={onRowClick}
    >
      {children}
    </RegistrationTable>
  );
};

export default PreregisterTable;
