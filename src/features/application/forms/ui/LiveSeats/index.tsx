'use client';

import { useEffect, useState } from 'react';
import {
  SEAT_STATUS_LABEL,
  SeatGroup,
  SeatStatus,
  getAgoLabel,
  getSeatStatus,
  getSeatSummary,
} from '../../model/liveSeats';

const STATUS_CLASS: Record<SeatStatus, string> = {
  OPEN: 'bg-main-100 text-main-600',
  WAITING_OPEN: 'bg-main-100 text-main-600',
  FULL: 'bg-gray-100 text-gray-500',
  CLOSED: 'bg-gray-100 text-gray-400',
  UNKNOWN: 'bg-gray-100 text-gray-500',
};

/** 카드 하나의 정원·현황. 공개 정원 API 가 없는 환경이나 현황이 없는 회차에는 아무것도 그리지 않는다 */
export const SeatSummary = ({
  group,
  id,
}: {
  group: SeatGroup | undefined;
  id: number;
}) => {
  if (!group || group.status === 'unsupported') return null;
  const entry = group.sessions.find((session) => session.id === id);
  // 정원 정보가 없는 회차(정책 없음)는 숫자 없이 둔다. 조회 실패만 확인 불가로 보인다
  if (!entry && group.status === 'ok') return null;
  const status = entry ? getSeatStatus(entry) : 'UNKNOWN';
  return (
    <div className="flex flex-col gap-4">
      <span
        className={`self-start rounded-full px-12 py-4 text-caption1b ${STATUS_CLASS[status]}`}
      >
        {SEAT_STATUS_LABEL[status]}
      </span>
      {entry?.seats &&
        !entry.closed &&
        getSeatSummary(entry.seats).map((line) => (
          <p key={line} className="break-keep text-caption1r text-gray-600">
            {line}
          </p>
        ))}
    </div>
  );
};

/** 화면 하나에 한 번. 마지막으로 받은 현황이 몇 초 전 것인지와 안내용이라는 문구를 보인다 */
export const LiveSeatsNote = ({
  fetchedAt,
  failed,
}: {
  fetchedAt: string | undefined;
  failed: boolean;
}) => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const updated = fetchedAt ? Date.parse(fetchedAt) : NaN;
  const parts = [
    Number.isNaN(updated)
      ? failed && '정원 현황을 불러오지 못했습니다.'
      : `${getAgoLabel(updated, now)}${failed ? '(갱신 실패, 마지막 현황)' : ''}`,
    '안내용이며 최종 판정은 신청 시 이루어집니다.',
  ];
  return (
    <p className="break-keep text-caption1r text-gray-500">
      {parts.filter(Boolean).join(' · ')}
    </p>
  );
};
