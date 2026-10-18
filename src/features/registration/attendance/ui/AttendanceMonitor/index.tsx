'use client';

import { useRegistrationExpo } from '../../../common';
import AttendanceOverview from '../AttendanceOverview';

/** 행사 당일 입구 모니터에 띄우는 입·퇴장 전용 화면 */
const AttendanceMonitor = () => {
  const { expo } = useRegistrationExpo();

  return (
    <div className="flex w-full max-w-[1200px] flex-1 flex-col space-y-20">
      <div className="flex flex-wrap items-baseline gap-x-12 gap-y-4">
        <p className="text-h2b text-black mobile:text-h3b">
          실시간 입·퇴장 현황
        </p>
        <p className="text-body2r text-gray-500">
          {expo ? `${expo.title} · ` : ''}행사장 출입 기록 모니터링
        </p>
      </div>

      <AttendanceOverview />
    </div>
  );
};

export default AttendanceMonitor;
