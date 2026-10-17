'use client';

import { useMemo } from 'react';
import {
  RegistrationTable,
  SectionError,
  StatusBadge,
  TableColumn,
} from '../../../common';
import {
  PROGRAM_TYPE_LABEL,
  toSessionKey,
  useCurrentSessions,
} from '../../../common/model/ledger';
import { AdminApplicationActivity } from '../../api/applicationActivityApi';
import { formatOccurredAt } from '../../model/adminChangeHistory';
import {
  getActivityActionLabel,
  getActivityActionTone,
  getActivityActorLabel,
  getActivityErrorMessage,
  useAdminApplicationActivities,
} from '../../model/applicationActivity';

const RECENT_COUNT = 8;

interface RecentActivityRow extends AdminApplicationActivity {
  programTitle: string | null;
}

const COLUMNS: TableColumn<RecentActivityRow>[] = [
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
      <StatusBadge tone={getActivityActionTone(action)}>
        {getActivityActionLabel(action)}
      </StatusBadge>
    ),
  },
  {
    key: 'program',
    label: '프로그램',
    flex: 2,
    render: ({ programType, programId, programTitle, definition }) => (
      <p className="break-words">
        {definition?.title ??
          programTitle ??
          `${PROGRAM_TYPE_LABEL[programType] ?? programType} #${programId}`}
      </p>
    ),
  },
  {
    key: 'actorId',
    label: '처리자',
    render: (row) => (
      <span
        className={
          !row.actorType || row.actorType === 'UNKNOWN'
            ? 'text-gray-400'
            : undefined
        }
      >
        {getActivityActorLabel(row)}
      </span>
    ),
  },
];

/** 대시보드에 보이는 최근 신청·취소·승급 처리. 전체 조회·필터는 행정 이력 화면에서 한다 */
const RecentActivityList = ({ expoId }: { expoId: string }) => {
  const { data, error, isPending, isError, refetch } =
    useAdminApplicationActivities(expoId);
  const sessions = useCurrentSessions(expoId);

  const rows = useMemo(() => {
    const titleByKey = new Map(
      (sessions.data ?? []).map((session) => [
        toSessionKey(session),
        session.title,
      ]),
    );
    return (data?.items ?? []).slice(0, RECENT_COUNT).map((item) => ({
      ...item,
      programTitle:
        titleByKey.get(
          toSessionKey({ programType: item.programType, id: item.programId }),
        ) ?? null,
    }));
  }, [data, sessions.data]);

  if (isError && !data) {
    return (
      <SectionError
        message={getActivityErrorMessage(error)}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <RegistrationTable
      columns={COLUMNS}
      rows={rows}
      emptyText={isPending ? '불러오는 중입니다.' : '처리 이력이 없습니다.'}
      footerText="전체 처리 이력"
      footerCount={data?.totalElements ?? 0}
      maxHeight="none"
      minWidth="640px"
    />
  );
};

export default RecentActivityList;
