'use client';

import { Component, ReactNode } from 'react';
import { EntrySummary } from '@/shared/types/exhibition/check-in/entry';
import { useEntrySummary } from '../../model/useEntrySummary';

const PAPER_CATEGORY_LABEL: Record<string, string> = {
  ADULT: '성인',
  CHILD: '학생',
  GENERAL: '구분 없음',
};

const WALK_IN_CATEGORY_LABEL = { ADULT: '성인', STUDENT: '어린이·학생' };

// 서버는 시간대 없는 지역 일시('2026-10-13T14:05:12.123')를 준다
const toTimeLabel = (generatedAt: unknown) =>
  typeof generatedAt === 'string' ? generatedAt.slice(11, 16) : '';

/**
 * 집계는 보조 정보라 응답 모양이 어긋나 렌더가 실패해도 이 패널만 접고 스캐너는 그대로 둔다.
 * 그렇지 않으면 app/error.tsx 가 페이지 전체(입장 스캔 포함)를 오류 화면으로 바꾼다
 */
class PanelErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="rounded-sm border-1 border-solid border-gray-200 p-24 mobile:p-16">
          <p role="alert" className="text-body2r text-gray-500">
            입장 처리 건수를 표시하지 못했습니다. 입장 스캔은 그대로 사용할 수
            있습니다.
          </p>
        </section>
      );
    }
    return this.props.children;
  }
}

const Item = ({
  label,
  value,
  sub,
}: {
  label: string;
  value: number | string;
  sub?: string;
}) => (
  <div className="space-y-6 rounded-sm bg-gray-100 px-16 py-14">
    <p className="break-keep text-caption1r text-gray-600">{label}</p>
    <div className="flex items-baseline gap-8">
      <p className="text-h2b text-black">{value}</p>
      {sub && (
        <p className="min-w-0 break-keep text-caption1r text-gray-500">{sub}</p>
      )}
    </div>
  </div>
);

// 응답에 필드가 빠져 와도 렌더가 멈추지 않도록 기본값을 둔다
const SummaryItems = ({ summary }: { summary: EntrySummary }) => (
  <div className="grid grid-cols-4 gap-12 mobile:grid-cols-2 tablet:grid-cols-3">
    <Item label="입장 합계" value={summary.totals?.entered ?? 0} />
    <Item label="퇴장" value={summary.totals?.exited ?? 0} />
    {/* 체류 값이 빠져 오면 실제 0명으로 오인하지 않도록 0 대신 '-'로 둔다 */}
    <Item
      label="기록상 체류(참고)"
      value={summary.totals?.stillInside ?? '-'}
      sub="QR 입장만"
    />
    <Item label="등록 QR 일반" value={summary.registered?.standard ?? 0} />
    <Item label="등록 QR 연수" value={summary.registered?.trainee ?? 0} />
    {(summary.paper ?? []).map(({ category, entered, exited }) => (
      <Item
        key={category ?? 'none'}
        label={`종이 QR ${PAPER_CATEGORY_LABEL[category ?? ''] ?? category ?? '구분 없음'}`}
        value={entered}
        sub={`퇴장 ${exited}`}
      />
    ))}
    {(summary.walkIn?.counts ?? []).map(({ category, count }) => (
      <Item
        key={category}
        label={`간편입장 ${WALK_IN_CATEGORY_LABEL[category] ?? category}`}
        value={count}
      />
    ))}
  </div>
);

const EntrySummaryContent = ({ expoId }: { expoId: string }) => {
  const { data, isLoading, isError, refetch, isFetching } =
    useEntrySummary(expoId);

  return (
    <section className="space-y-16 rounded-sm border-1 border-solid border-gray-200 p-24 mobile:p-16">
      <div className="flex items-center justify-between gap-12">
        <p className="text-body1b text-black">오늘 입장 처리 건수</p>
        <div className="flex items-center gap-12">
          {data && (
            <p className="text-caption1r text-gray-400">
              {toTimeLabel(data.generatedAt)} 기준
            </p>
          )}
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="rounded-sm border-1 border-solid border-gray-200 px-12 py-6 text-caption1b text-gray-700 disabled:text-gray-300"
          >
            새로고침
          </button>
        </div>
      </div>
      {isLoading ? (
        <p className="text-body2r text-gray-400">불러오는 중...</p>
      ) : isError || !data ? (
        <p role="alert" className="text-body2r text-gray-500">
          입장 처리 건수를 불러오지 못했습니다. 관리자 계정인지 확인한 뒤
          새로고침해 주세요.
        </p>
      ) : (
        <SummaryItems summary={data} />
      )}
    </section>
  );
};

/** 오늘 입장 처리 건수. 다른 입구에서 처리한 건수까지 서버 집계로 보여 준다 */
const EntrySummaryPanel = ({ expoId }: { expoId: string }) => (
  <PanelErrorBoundary>
    <EntrySummaryContent expoId={expoId} />
  </PanelErrorBoundary>
);

export default EntrySummaryPanel;
