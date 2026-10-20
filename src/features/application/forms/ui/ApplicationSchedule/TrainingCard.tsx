'use client';

import Link from 'next/link';
import { useState } from 'react';
import { formatDefinitionSchedule } from '@/features/registration/common/model/ledger';
import {
  SCHEDULE_STATUS_LABEL,
  ScheduleStatus,
} from '../../model/applicationSchedule';
import {
  getSessionLabel,
  getSessionTopic,
  type CategoryGroup,
} from '../../model/applicationSections';
import { formatProgramPlace } from '../../model/programApply';
import type { CategorySession } from './CategoryCard';

/** 연수사마다 색과 마크를 달리해 한눈에 구분한다. 목록에 없는 분류는 회색 */
const BRAND: Record<string, { accent: string; mark: string }> = {
  samsung: { accent: '#183f99', mark: 'S' },
  google: { accent: '#2478d4', mark: 'G' },
  apple: { accent: '#505762', mark: 'A' },
};
const FALLBACK_BRAND = { accent: '#64748b', mark: '' };

const STATUS_CLASS: Record<ScheduleStatus, string> = {
  UPCOMING: 'bg-gray-100 text-gray-500',
  OPEN: 'bg-white text-main-600',
  CLOSED: 'bg-gray-100 text-gray-400',
  ENDED: 'bg-gray-100 text-gray-400',
  UNSET: 'bg-gray-100 text-gray-400',
};

/**
 * 교원연수 한 곳(삼성·구글·애플)의 카드. 회차별 시간과 주제를 눌러 들어가지 않고 바로 보여 주고,
 * 회차를 고르면 그 회차만 신청 화면으로 넘긴다. 접수 중인 회차만 고를 수 있다
 */
const TrainingCard = ({
  group,
  sessions,
  applyHref,
}: {
  group: CategoryGroup;
  sessions: CategorySession[];
  applyHref: string;
}) => {
  const [selectedId, setSelectedId] = useState<number>();
  const { accent, mark } = BRAND[group.key] ?? FALLBACK_BRAND;
  const place =
    sessions.find(({ place: value }) => value?.trim())?.place ?? group.place;
  const selected = sessions.find(({ id }) => id === selectedId);
  const isAnyOpen = sessions.some(({ status }) => status === 'OPEN');

  return (
    <li
      className="flex min-w-0 flex-col gap-16 rounded-md border-1 border-t-[5px] border-solid border-gray-200 p-20 mobile:p-16"
      style={{
        borderTopColor: accent,
        background: `linear-gradient(180deg, ${accent}14, #ffffff 140px)`,
      }}
    >
      <div className="flex flex-wrap items-center gap-12">
        <span
          aria-hidden
          className="grid h-[38px] min-w-[38px] place-items-center rounded-sm text-body1b text-white"
          style={{ backgroundColor: accent }}
        >
          {mark || group.label.slice(0, 1)}
        </span>
        <h3
          className="break-keep text-h3b mobile:text-body1b"
          style={{ color: accent }}
        >
          {group.label}
        </h3>
        <span className="rounded-sm border-1 border-solid border-gray-200 bg-white px-12 py-6 text-caption1b text-gray-700">
          {formatProgramPlace(place)}
        </span>
      </div>

      <ul
        role="radiogroup"
        aria-label={`${group.label} 회차`}
        className="grid grid-cols-2 gap-8 mobile:grid-cols-1"
      >
        {sessions.map((session) => {
          const isSelected = session.id === selectedId;
          const isOpen = session.status === 'OPEN';
          const topic = getSessionTopic(session.title, group.label);
          return (
            <li key={session.id} className="flex">
              <button
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={!isOpen}
                onClick={() =>
                  setSelectedId(isSelected ? undefined : session.id)
                }
                className="flex min-w-0 flex-1 items-start gap-10 rounded-sm border-1 border-solid bg-white px-12 py-12 text-left disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  borderColor: isSelected ? accent : '#e5e7eb',
                  boxShadow: isSelected
                    ? `inset 0 0 0 1px ${accent}`
                    : undefined,
                }}
              >
                <span
                  aria-hidden
                  className="mt-4 h-[16px] w-[16px] flex-none rounded-full border-solid bg-white"
                  style={{
                    borderColor: isSelected ? accent : '#cbd5e1',
                    borderWidth: isSelected ? 5 : 2,
                  }}
                />
                <span className="flex min-w-0 flex-1 flex-col gap-4">
                  <span className="flex flex-wrap items-center gap-8">
                    <span
                      className="rounded-sm px-8 py-2 text-caption1b text-white"
                      style={{ backgroundColor: accent }}
                    >
                      {getSessionLabel(session.title, group.label)}
                    </span>
                    <span className="text-body2b" style={{ color: accent }}>
                      {formatDefinitionSchedule(
                        session.startedAt,
                        session.endedAt,
                      )}
                    </span>
                  </span>
                  {topic && (
                    <span className="break-keep text-caption1r text-gray-600">
                      {topic}
                    </span>
                  )}
                  {!isOpen && (
                    <span
                      className={`self-start rounded-full px-8 py-2 text-caption1b ${STATUS_CLASS[session.status]}`}
                    >
                      {SCHEDULE_STATUS_LABEL[session.status]}
                    </span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {selected ? (
        <Link
          href={`${applyHref}?category=${encodeURIComponent(group.key)}&programId=${selected.id}`}
          className="rounded-sm px-16 py-12 text-center text-body2b text-white"
          style={{ backgroundColor: accent }}
        >
          {getSessionLabel(selected.title, group.label)} 신청하기 →
        </Link>
      ) : (
        <span
          aria-disabled
          className="rounded-sm bg-gray-100 px-16 py-12 text-center text-body2b text-gray-400"
        >
          {isAnyOpen
            ? '신청할 회차를 선택해 주세요'
            : '지금은 신청할 수 없습니다'}
        </span>
      )}
    </li>
  );
};

export default TrainingCard;
