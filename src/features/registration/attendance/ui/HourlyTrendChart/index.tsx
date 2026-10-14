'use client';

import { useEffect, useRef, useState } from 'react';

export interface HourlyPoint {
  hour: number;
  entered: number;
  exited: number;
}

const HEIGHT = 240;
const PADDING = { top: 16, right: 16, bottom: 32, left: 40 };
const GRID_COUNT = 4;

const SERIES = [
  { key: 'entered', label: '입장', stroke: 'var(--color-main-600)' },
  { key: 'exited', label: '퇴장', stroke: 'var(--color-gray-400)' },
] as const;

// 눈금이 1·2·5 단위로 떨어지도록 최댓값을 올린다
const getNiceMax = (value: number) => {
  if (value <= 0) return GRID_COUNT;
  const step = value / GRID_COUNT;
  const magnitude = 10 ** Math.floor(Math.log10(step));
  const nice =
    [1, 2, 5, 10].find((unit) => unit * magnitude >= step)! * magnitude;
  return nice * GRID_COUNT;
};

// 글자 크기가 변하지 않도록 실제 너비로 다시 그린다
const useWidth = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) =>
      setWidth(entry.contentRect.width),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return { ref, width };
};

/** 시간대별 입장·퇴장 꺾은선 그래프. 차트 라이브러리 없이 SVG 로 그린다 */
const HourlyTrendChart = ({ data }: { data: HourlyPoint[] }) => {
  const { ref, width } = useWidth();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const max = getNiceMax(
    Math.max(0, ...data.flatMap(({ entered, exited }) => [entered, exited])),
  );
  const plotWidth = Math.max(0, width - PADDING.left - PADDING.right);
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;
  const step = data.length > 1 ? plotWidth / (data.length - 1) : 0;
  const x = (index: number) => PADDING.left + index * step;
  const y = (value: number) => PADDING.top + plotHeight * (1 - value / max);
  // 좁은 화면에서는 시각 라벨을 건너뛴다
  const labelEvery = step > 0 && step < 36 ? 2 : 1;

  const totalEntered = data.reduce((sum, { entered }) => sum + entered, 0);
  const totalExited = data.reduce((sum, { exited }) => sum + exited, 0);
  const peak = data.reduce<HourlyPoint | null>(
    (top, point) => (!top || point.entered > top.entered ? point : top),
    null,
  );
  const summary = `시간대별 입·퇴장 추이. 입장 ${totalEntered.toLocaleString()}건, 퇴장 ${totalExited.toLocaleString()}건${
    peak
      ? `, 입장이 가장 많은 시간대는 ${peak.hour}시(${peak.entered.toLocaleString()}건)`
      : ''
  }`;
  const active = activeIndex === null ? null : data[activeIndex];

  return (
    <div className="space-y-12">
      <div className="flex gap-16" aria-hidden>
        {SERIES.map((series) => (
          <span
            key={series.key}
            className="flex items-center gap-6 text-caption1r text-gray-500"
          >
            <span
              className="h-[2px] w-16 rounded-full"
              style={{ backgroundColor: series.stroke }}
            />
            {series.label}
          </span>
        ))}
      </div>

      <div ref={ref} className="relative w-full">
        {width > 0 && (
          <svg
            width={width}
            height={HEIGHT}
            role="img"
            aria-label={summary}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <title>{summary}</title>
            {Array.from({ length: GRID_COUNT + 1 }, (_, index) => {
              const value = (max / GRID_COUNT) * index;
              return (
                <g key={index}>
                  <line
                    x1={PADDING.left}
                    x2={width - PADDING.right}
                    y1={y(value)}
                    y2={y(value)}
                    stroke="var(--color-gray-100)"
                  />
                  <text
                    x={PADDING.left - 8}
                    y={y(value)}
                    textAnchor="end"
                    dominantBaseline="middle"
                    className="fill-gray-400 text-caption2r"
                  >
                    {value.toLocaleString()}
                  </text>
                </g>
              );
            })}

            {data.map(({ hour }, index) =>
              index % labelEvery === 0 ? (
                <text
                  key={hour}
                  x={x(index)}
                  y={HEIGHT - 8}
                  textAnchor="middle"
                  className="fill-gray-400 text-caption2r"
                >
                  {hour}시
                </text>
              ) : null,
            )}

            {activeIndex !== null && (
              <line
                x1={x(activeIndex)}
                x2={x(activeIndex)}
                y1={PADDING.top}
                y2={PADDING.top + plotHeight}
                stroke="var(--color-gray-300)"
              />
            )}

            {SERIES.map((series) => (
              <g key={series.key}>
                <polyline
                  fill="none"
                  stroke={series.stroke}
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  points={data
                    .map(
                      (point, index) => `${x(index)},${y(point[series.key])}`,
                    )
                    .join(' ')}
                />
                {active && (
                  <circle
                    cx={x(activeIndex!)}
                    cy={y(active[series.key])}
                    r={4}
                    fill={series.stroke}
                    stroke="var(--color-white)"
                    strokeWidth={2}
                  />
                )}
              </g>
            ))}

            {/* 점보다 넓은 영역에서 마우스를 받는다 */}
            {data.map(({ hour }, index) => (
              <rect
                key={hour}
                x={x(index) - step / 2}
                y={PADDING.top}
                width={Math.max(step, 1)}
                height={plotHeight}
                fill="transparent"
                onMouseEnter={() => setActiveIndex(index)}
              />
            ))}
          </svg>
        )}

        {active && (
          <div
            aria-hidden
            className="pointer-events-none absolute top-0 space-y-4 rounded-sm border-1 border-solid border-gray-200 bg-white px-12 py-8 text-caption1r text-gray-500"
            style={{
              left: Math.min(x(activeIndex!) + 12, Math.max(0, width - 120)),
            }}
          >
            <p className="text-caption1b text-black">
              {active.hour}:00 ~ {active.hour + 1}:00
            </p>
            {SERIES.map((series) => (
              <p key={series.key} className="flex items-center gap-6">
                <span
                  className="h-[2px] w-8 rounded-full"
                  style={{ backgroundColor: series.stroke }}
                />
                {series.label} {active[series.key].toLocaleString()}건
              </p>
            ))}
          </div>
        )}
      </div>

      <table className="sr-only">
        <caption>시간대별 입·퇴장 건수</caption>
        <thead>
          <tr>
            <th scope="col">시간대</th>
            <th scope="col">입장</th>
            <th scope="col">퇴장</th>
          </tr>
        </thead>
        <tbody>
          {data.map(({ hour, entered, exited }) => (
            <tr key={hour}>
              <th scope="row">{hour}시</th>
              <td>{entered}</td>
              <td>{exited}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HourlyTrendChart;
