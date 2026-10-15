'use client';

import Link from 'next/link';
import { getExpoRoutes } from '@/shared/config';
import { useRegistrationExpo } from '../../../common';
import AttendanceOverview from '../AttendanceOverview';

const LINK_CLASS =
  'rounded-sm border-1 border-solid border-gray-200 px-16 py-8 text-body2r text-gray-500 duration-200 hover:border-main-600 hover:text-main-600 mobile:text-caption1r';

/** 행사 당일 입구 모니터에 띄우는 입·퇴장 전용 화면 */
const AttendanceMonitor = () => {
  const { expoId, expo, routes } = useRegistrationExpo();
  const expoRoutes = getExpoRoutes(expoId);

  return (
    <div className="flex w-full max-w-[1200px] flex-1 flex-col space-y-[54px]">
      <div className="flex items-end justify-between gap-16 tablet:flex-col tablet:items-start">
        <div className="space-y-8">
          <p className="text-h1m text-black mobile:text-h2b">
            실시간 입·퇴장 현황
          </p>
          <p className="text-body2r text-gray-500">
            {expo ? `${expo.title} · ` : ''}행사장 출입 기록 모니터링
          </p>
        </div>
        <nav aria-label="입장 관련 메뉴" className="flex flex-wrap gap-8">
          <Link href={expoRoutes.paperQr} className={LINK_CLASS}>
            현장 QR 발급
          </Link>
          <Link href={expoRoutes.checkIn} className={LINK_CLASS}>
            입장 스캔
          </Link>
          <Link href={routes.applications} className={LINK_CLASS}>
            접수대장
          </Link>
        </nav>
      </div>

      <AttendanceOverview />
    </div>
  );
};

export default AttendanceMonitor;
