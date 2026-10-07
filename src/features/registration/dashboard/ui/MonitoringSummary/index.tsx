'use client';

import { useRegistrationMonitoring } from '../../../common';

interface MonitoringSummaryProps {
  activeQrCount: number;
}

const formatCount = (value: number | undefined) =>
  value === undefined ? '-' : value.toLocaleString();

const MonitoringSummary = ({ activeQrCount }: MonitoringSummaryProps) => {
  const { data } = useRegistrationMonitoring();

  return (
    <p className="text-body2r text-gray-400">
      오늘 신청화면 조회 {formatCount(data?.todayPageView)}회 · 방문자{' '}
      {formatCount(data?.todayUniqueVisitor)}명 · 누적 조회{' '}
      {formatCount(data?.totalPageView)}회 · 활성 QR{' '}
      {activeQrCount.toLocaleString()}개 · 오늘 체크인{' '}
      {formatCount(data?.todayCheckInCount)}건
    </p>
  );
};

export default MonitoringSummary;
