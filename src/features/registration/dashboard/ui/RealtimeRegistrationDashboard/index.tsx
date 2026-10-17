'use client';

import { ComponentProps, useMemo } from 'react';
import {
  AdminRealtimeProvider,
  AdminRealtimeTarget,
} from '@/shared/libs/realtime/AdminRealtimeProvider';
import { useRegistrationExpo } from '../../../common';
import { preregisterSummaryQueryKey } from '../../../common/model/preregisterSummary';
import RegistrationDashboard from '../RegistrationDashboard';

/**
 * 종합 대시보드가 다시 읽을 기존 GET. 신청 신호는 신청·확정·대기·취소·회차별 요약과 최근 신청·처리 이력,
 * 출석 신호는 회차별 출석이 들어 있는 신청 요약만 다시 읽는다. 조회 수·QR 같은 지표는 기존 polling 그대로다
 */
const toDashboardTargets = (expoId: string): AdminRealtimeTarget[] => [
  {
    resource: 'APPLICATIONS',
    queryKeys: [
      ['adminApplicationSummary', expoId],
      ['adminApplications', expoId],
      preregisterSummaryQueryKey(expoId),
      ['adminApplicationActivities', expoId],
    ],
  },
  {
    resource: 'ATTENDANCE',
    queryKeys: [['adminApplicationSummary', expoId]],
  },
];

/** 종합 대시보드에 신청·출석 SSE 구독을 붙인다. 화면 구성은 RegistrationDashboard 그대로다 */
const RealtimeRegistrationDashboard = (
  props: ComponentProps<typeof RegistrationDashboard>,
) => {
  const { expoId } = useRegistrationExpo();
  const targets = useMemo(() => toDashboardTargets(expoId), [expoId]);

  return (
    <AdminRealtimeProvider expoId={expoId} targets={targets}>
      <RegistrationDashboard {...props} />
    </AdminRealtimeProvider>
  );
};

export default RealtimeRegistrationDashboard;
