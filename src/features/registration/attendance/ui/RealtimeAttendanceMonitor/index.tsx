'use client';

import { useMemo } from 'react';
import { normalizeExpoId } from '@/shared/config';
import {
  AdminRealtimeProvider,
  AdminRealtimeTarget,
} from '@/shared/libs/realtime/AdminRealtimeProvider';
import { useRegistrationExpo } from '../../../common';
import AttendanceMonitor from '../AttendanceMonitor';

/**
 * 입퇴장 신호가 오면 집계·시간대별 추이·최근 기록·스캐너별 건수를 다시 읽는다.
 * 날짜는 키 뒤쪽이라 지금 고른 날짜 탭 그대로 다시 읽는다
 */
const toAttendanceTargets = (serverExpoId: string): AdminRealtimeTarget[] => [
  {
    resource: 'ATTENDANCE',
    queryKeys: [
      ['attendanceSummary', serverExpoId],
      ['attendanceHourly', serverExpoId],
      ['attendanceRecent', serverExpoId],
      ['attendanceScanners', serverExpoId],
    ],
  },
];

/** 실시간 입퇴장 모니터링에 입퇴장 SSE 구독을 붙인다. 화면 구성은 AttendanceMonitor 그대로다 */
const RealtimeAttendanceMonitor = () => {
  const { expoId } = useRegistrationExpo();
  const serverExpoId = normalizeExpoId(expoId) ?? expoId;
  const targets = useMemo(
    () => toAttendanceTargets(serverExpoId),
    [serverExpoId],
  );

  return (
    <AdminRealtimeProvider expoId={expoId} targets={targets}>
      <AttendanceMonitor />
    </AdminRealtimeProvider>
  );
};

export default RealtimeAttendanceMonitor;
