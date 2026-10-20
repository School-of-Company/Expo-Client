import Link from 'next/link';
import { formatDefinitionSchedule } from '@/features/registration/common/model/ledger';
import {
  SCHEDULE_STATUS_LABEL,
  ScheduleStatus,
} from '../../model/applicationSchedule';
import {
  getSessionLabel,
  getSessionTopic,
} from '../../model/applicationSections';
import { formatProgramPlace } from '../../model/programApply';
import type { CategoryGroup } from '../../model/applicationSections';

export interface CategorySession {
  id: number;
  title: string;
  startedAt: string;
  endedAt: string;
  status: ScheduleStatus;
  /** 정원 숫자를 보여도 되는 회차만 채운다(교사 대상은 신청 전 숫자를 숨긴다) */
  capacity?: number;
  place?: string | null;
}

const STATUS_CLASS: Record<ScheduleStatus, string> = {
  UPCOMING: 'bg-main-100 text-main-600',
  OPEN: 'bg-main-600 text-white',
  CLOSED: 'bg-gray-100 text-gray-500',
  ENDED: 'bg-gray-100 text-gray-400',
  UNSET: 'bg-gray-100 text-gray-500',
};

/**
 * 프로그램·연수 분류 하나(삼성 연수, 기조강연 등)의 카드. 회차를 줄로 보여 주고 아래 버튼으로 신청 화면에 간다.
 * 신청 화면이 회차를 고르게 하므로 이 카드는 회차 선택을 넘기지 않는다
 */
const CategoryCard = ({
  group,
  sessions,
  applyHref,
}: {
  group: CategoryGroup;
  sessions: CategorySession[];
  applyHref: string;
}) => {
  const isOpen = sessions.some(({ status }) => status === 'OPEN');
  const place = sessions.find(({ place: value }) => value?.trim())?.place;
  return (
    <li
      className="flex min-w-0 flex-col gap-12 rounded-md border-1 border-t-[4px] border-solid border-gray-200 bg-white p-16"
      style={{ borderTopColor: group.accent }}
    >
      <div className="flex items-center gap-12">
        <span
          aria-hidden
          className="grid h-[34px] min-w-[34px] place-items-center rounded-sm text-body2b text-white"
          style={{ backgroundColor: group.accent }}
        >
          {group.mark}
        </span>
        <h3 className="break-keep text-body1b text-black">{group.label}</h3>
      </div>
      <p className="break-words break-keep rounded-sm border-1 border-solid border-gray-200 px-12 py-8 text-caption1b text-gray-700">
        {formatProgramPlace(place)}
      </p>
      <ul className="flex flex-col gap-8">
        {sessions.map((session) => {
          const label = getSessionLabel(session.title, group.label);
          const topic = getSessionTopic(session.title, group.label);
          return (
            <li
              key={session.id}
              className="flex flex-col gap-4 rounded-sm border-1 border-solid border-gray-200 px-12 py-10"
            >
              <div className="flex flex-wrap items-center gap-8">
                {label !== '신청' && (
                  <span
                    className="rounded-sm px-8 py-2 text-caption1b text-white"
                    style={{ backgroundColor: group.accent }}
                  >
                    {label}
                  </span>
                )}
                <span
                  className={`rounded-full px-8 py-2 text-caption1b ${STATUS_CLASS[session.status]}`}
                >
                  {SCHEDULE_STATUS_LABEL[session.status]}
                </span>
              </div>
              <p className="text-body2b" style={{ color: group.accent }}>
                {formatDefinitionSchedule(session.startedAt, session.endedAt)}
              </p>
              {topic && (
                <p className="break-keep text-caption1r text-gray-600">
                  {topic}
                </p>
              )}
              {session.capacity !== undefined && (
                <p className="text-caption1r text-gray-500">
                  정원 {session.capacity.toLocaleString()}명
                </p>
              )}
            </li>
          );
        })}
      </ul>
      {isOpen ? (
        <Link
          href={applyHref}
          className="mt-auto rounded-sm px-16 py-12 text-center text-body2b text-white"
          style={{ backgroundColor: group.accent }}
        >
          신청하기 →
        </Link>
      ) : (
        <span
          aria-disabled
          className="mt-auto rounded-sm bg-gray-100 px-16 py-12 text-center text-body2b text-gray-400"
        >
          지금은 신청할 수 없습니다
        </span>
      )}
    </li>
  );
};

export default CategoryCard;
