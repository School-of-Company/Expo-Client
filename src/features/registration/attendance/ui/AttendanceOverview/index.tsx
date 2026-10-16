'use client';

import { ReactNode, useMemo, useState } from 'react';
import { Loading } from '@/shared/ui';
import {
  formatDateWithWeekday,
  RefreshStatus,
  SectionError,
  SegmentTabs,
  StatCard,
  useRegistrationExpo,
} from '../../../common';
import { useAttendanceActivity } from '../../model/attendanceActivity';
import {
  ALL_DAYS,
  getDefaultDay,
  getEntryMethodCounts,
  getExpoDays,
  useAttendanceSummary,
} from '../../model/attendanceSummary';
import CountList from '../CountList';
import HourlyTrendChart from '../HourlyTrendChart';
import RecentAttendanceTable from '../RecentAttendanceTable';

const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <section className="min-w-0 space-y-16">
    <p className="text-body1b text-black">{title}</p>
    {children}
  </section>
);

/** 영역마다 따로 불러와 하나가 실패해도 나머지는 보여 준다 */
const QueryContent = <T,>({
  query,
  errorText,
  children,
}: {
  query: { data?: T; isError: boolean; refetch: () => unknown };
  errorText: string;
  children: (data: T) => ReactNode;
}) => {
  if (query.data !== undefined) return <>{children(query.data)}</>;
  if (query.isError)
    return <SectionError message={errorText} onRetry={query.refetch} />;
  return (
    <div className="flex justify-center py-40">
      <Loading />
    </div>
  );
};

/** 행사장 입·퇴장 집계를 날짜별로 보고 10초마다 갱신한다 */
const AttendanceOverview = () => {
  const { expoId, expo } = useRegistrationExpo();
  const days = useMemo(
    () => getExpoDays(expo?.startedDay, expo?.finishedDay),
    [expo?.startedDay, expo?.finishedDay],
  );
  // 박람회 정보를 읽기 전에는 고른 날짜가 없다
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const day = selectedDay ?? getDefaultDay(days);
  const isAll = day === ALL_DAYS;

  const summary = useAttendanceSummary(expoId, day);
  const activity = useAttendanceActivity(expoId, day);
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
              value={data.uniqueQr.toLocaleString()}
              unit="건"
              sub={
                isAll
                  ? '사전등록·인쇄 QR · 여러 날 입장해도 한 번'
                  : '사전등록·인쇄 QR 중복 제외'
              }
            />
            <StatCard
              label="퇴장 처리"
              value={data.totals.exited.toLocaleString()}
              unit="건"
              sub={`기록상 체류(참고) ${data.totals.stillInside.toLocaleString()}명`}
            />
            <StatCard
              label="최근 10분 입장"
              value={data.recentEntered10m.toLocaleString()}
              unit="건"
              sub="고른 날짜와 상관없이 지금 기준"
            />
          </div>
        )}
        <p className="break-keep text-caption1r text-gray-400">
          {isAll && '전체 기록은 박람회 전체 기간 집계입니다. '}
          기록상 체류는 퇴장 미스캔 등으로 실제 현장 인원과 다를 수 있습니다.
        </p>
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-[32px] tablet:grid-cols-1">
        <Section title="시간대별 입·퇴장 추이">
          <QueryContent
            query={activity.hourly}
            errorText="시간대별 입·퇴장 건수를 불러오지 못했습니다."
          >
            {(points) => (
              <div className="rounded-sm border-1 border-solid border-gray-200 px-24 py-20 mobile:px-16">
                <HourlyTrendChart data={points} />
              </div>
            )}
          </QueryContent>
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

      <div className="grid grid-cols-[2fr_1fr] gap-[32px] tablet:grid-cols-1">
        <Section title="최근 입·퇴장 기록">
          <QueryContent
            query={activity.recent}
            errorText="최근 입·퇴장 기록을 불러오지 못했습니다."
          >
            {(records) => <RecentAttendanceTable rows={records} />}
          </QueryContent>
        </Section>
        <Section title="스캐너별 입장 처리">
          <QueryContent
            query={activity.scanners}
            errorText="스캐너별 입장 처리 건수를 불러오지 못했습니다."
          >
            {(scanners) => (
              <CountList
                items={scanners.map(({ scanner, entered }) => ({
                  label: scanner,
                  count: entered,
                }))}
                emptyText="스캐너 이름이 기록된 입장 처리가 없습니다."
              />
            )}
          </QueryContent>
        </Section>
      </div>
    </div>
  );
};

export default AttendanceOverview;
