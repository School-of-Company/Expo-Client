'use client';

import { ReactNode, useMemo, useState } from 'react';
import { Loading, MockDataBadge } from '@/shared/ui';
import {
  formatDateWithWeekday,
  RefreshStatus,
  SectionError,
  SegmentTabs,
  StatCard,
  useRegistrationExpo,
} from '../../../common';
import { ATTENDANCE_ACTIVITY_ISSUE } from '../../mock/attendanceActivity';
import { useAttendanceActivity } from '../../model/attendanceActivity';
import {
  ALL_DAYS,
  ATTENDANCE_REFRESH_MS,
  getDefaultDay,
  getEntryMethodCounts,
  getExpoDays,
  getIdentifiedEntered,
  useAttendanceSummary,
} from '../../model/attendanceSummary';
import CountList from '../CountList';
import HourlyTrendChart from '../HourlyTrendChart';
import RecentAttendanceTable from '../RecentAttendanceTable';

const Section = ({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: ReactNode;
  children: ReactNode;
}) => (
  <section className="min-w-0 space-y-16">
    <div className="flex items-center gap-12">
      <p className="text-body1b text-black">{title}</p>
      {badge}
    </div>
    {children}
  </section>
);

const mockBadge = <MockDataBadge issue={ATTENDANCE_ACTIVITY_ISSUE} />;

interface AttendanceOverviewProps {
  /** 전용 화면에서는 최근 기록·스캐너별 처리까지 보여 준다. 대시보드는 집계·추이만 */
  detailed?: boolean;
}

/** 행사장 입·퇴장 집계를 날짜별로 보고 10초마다 갱신한다 */
const AttendanceOverview = ({ detailed = false }: AttendanceOverviewProps) => {
  const { expoId, expo } = useRegistrationExpo();
  const days = useMemo(
    () => getExpoDays(expo?.startedDay, expo?.finishedDay),
    [expo?.startedDay, expo?.finishedDay],
  );
  // 박람회 정보를 읽기 전에는 고른 날짜가 없다
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const day = selectedDay ?? getDefaultDay(days);
  const isAll = day === ALL_DAYS;

  const summary = useAttendanceSummary(expoId, day, days);
  const activity = useAttendanceActivity(expoId, day, days);
  const data = summary.data;

  const dayOptions = [
    ...days.map((value) => ({
      value,
      label: formatDateWithWeekday(value),
    })),
    { value: ALL_DAYS, label: '전체 기록' },
  ];

  return (
    <div className="flex w-full flex-col space-y-[40px]">
      <div className="space-y-24">
        <div className="flex items-center justify-between gap-16 tablet:flex-col tablet:items-start">
          {days.length > 0 && (
            <SegmentTabs
              ariaLabel="조회 날짜"
              value={day}
              options={dayOptions}
              onChange={setSelectedDay}
            />
          )}
          <RefreshStatus
            updatedAt={summary.updatedAt}
            isFetching={summary.isFetching}
            onRefresh={summary.refetch}
            intervalMs={ATTENDANCE_REFRESH_MS}
            hasError={summary.isError && Boolean(data)}
          />
        </div>

        {summary.isError && !data ? (
          <SectionError
            message="입·퇴장 집계를 불러오지 못했습니다. 관리자 계정인지 확인한 뒤 다시 시도해 주세요."
            onRetry={summary.refetch}
          />
        ) : !data ? (
          <div className="flex justify-center py-40">
            <Loading />
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-16 mobile:grid-cols-1 tablet:grid-cols-2">
            <StatCard
              label="누적 입장 처리"
              value={data.totals.entered.toLocaleString()}
              unit="건"
              sub="사전등록·인쇄 QR·간편입장 포함"
              emphasis
            />
            <StatCard
              label="고유 식별 QR"
              value={getIdentifiedEntered(data).toLocaleString()}
              unit="건"
              sub={
                isAll
                  ? '날짜별 합계 · 여러 날 입장한 QR 은 날마다 셈'
                  : '사전등록·인쇄 QR 중복 제외'
              }
            />
            <StatCard
              label="퇴장 처리"
              value={data.totals.exited.toLocaleString()}
              unit="건"
              sub={`현재 체류 ${data.totals.stillInside.toLocaleString()}명`}
            />
            <StatCard
              label="최근 10분 입장"
              value={
                activity.recentEntered === null
                  ? '—'
                  : activity.recentEntered.toLocaleString()
              }
              unit={activity.recentEntered === null ? undefined : '건'}
              sub="오늘 날짜에서만 집계"
              badge={mockBadge}
            />
          </div>
        )}
        {isAll && (
          <p className="text-caption1r text-gray-400">
            전체 기록은 날짜별 집계를 더한 값입니다. 현재 체류는 날마다 남은
            인원의 합입니다.
          </p>
        )}
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-[32px] tablet:grid-cols-1">
        <Section title="시간대별 입·퇴장 추이" badge={mockBadge}>
          <div className="rounded-sm border-1 border-solid border-gray-200 px-24 py-20 mobile:px-16">
            <HourlyTrendChart data={activity.hourly} />
          </div>
        </Section>
        <Section title="입장 방식별 현황">
          {data ? (
            <CountList
              items={getEntryMethodCounts(data)}
              emptyText="입장 기록이 없습니다."
            />
          ) : (
            <p className="text-body2r text-gray-400">
              {summary.isError
                ? '집계를 불러오지 못했습니다.'
                : '불러오는 중...'}
            </p>
          )}
        </Section>
      </div>

      {detailed && (
        <div className="grid grid-cols-[2fr_1fr] gap-[32px] tablet:grid-cols-1">
          <Section title="최근 입·퇴장 기록" badge={mockBadge}>
            <RecentAttendanceTable rows={activity.logs} />
          </Section>
          <Section title="스캐너별 입장 처리" badge={mockBadge}>
            <CountList
              items={activity.scanners.map(({ scannerName, entered }) => ({
                label: scannerName,
                count: entered,
              }))}
              emptyText="입장을 처리한 스캐너가 없습니다."
            />
          </Section>
        </div>
      )}
    </div>
  );
};

export default AttendanceOverview;
