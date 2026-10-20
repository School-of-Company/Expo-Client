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
  place?: string | null;
}

const STATUS_CLASS: Record<ScheduleStatus, string> = {
  UPCOMING: 'text-gray-400',
  OPEN: 'text-main-600',
  CLOSED: 'text-gray-400',
  ENDED: 'text-gray-400',
  UNSET: 'text-gray-400',
};

const dateOf = (startedAt: string) =>
  formatDefinitionSchedule(startedAt, null).split(' ')[0];

/**
 * 프로그램·연수 분류 하나(삼성 연수, 기조강연 등)의 카드. 목록에서는 이름·장소·날짜·접수 여부만 보여 주고,
 * 회차별 시간과 자세한 내용은 신청 화면에서 보인다
 */
const CategoryCard = ({
  group,
  sessions,
  applyHref,
  selectable,
}: {
  group: CategoryGroup;
  sessions: CategorySession[];
  applyHref: string;
  /** 켜면 회차를 카드 안에 펼쳐 누른 회차로 바로 신청 화면에 보낸다 */
  selectable?: boolean;
}) => {
  const isOpen = sessions.some(({ status }) => status === 'OPEN');
  const status: ScheduleStatus = isOpen ? 'OPEN' : sessions[0].status;
  const place =
    sessions.find(({ place: value }) => value?.trim())?.place ?? group.place;
  const first = dateOf(sessions[0].startedAt);
  const last = dateOf(sessions[sessions.length - 1].startedAt);
  return (
    <li className="flex min-w-0 flex-col gap-8 rounded-sm border-1 border-solid border-gray-200 bg-white p-20">
      <div className="flex items-center justify-between gap-8">
        <h3 className="break-keep text-body1b text-black">{group.label}</h3>
        <span className={`flex-none text-caption1b ${STATUS_CLASS[status]}`}>
          {SCHEDULE_STATUS_LABEL[status]}
        </span>
      </div>
      <p className="break-words break-keep text-caption1r text-gray-500">
        {formatProgramPlace(place)}
      </p>
      {selectable ? (
        <ul
          aria-label={`${group.label} 회차`}
          className="mb-8 grid auto-rows-fr grid-cols-2 gap-8 mobile:grid-cols-1"
        >
          {sessions.map((session) => {
            const open = session.status === 'OPEN';
            const topic = getSessionTopic(session.title, group.label);
            const className = `flex min-w-0 flex-1 flex-col gap-2 rounded-sm border-1 border-solid border-gray-200 bg-white px-12 py-12 text-left ${open ? 'hover:border-main-600 hover:bg-main-100' : 'opacity-60'}`;
            const content = (
              <>
                <span className="truncate text-body2b text-black">
                  {getSessionLabel(session.title, group.label)} ·{' '}
                  {formatDefinitionSchedule(session.startedAt, session.endedAt)}
                </span>
                <span className="truncate text-caption1r text-gray-500">
                  {open
                    ? topic || '신청하기 →'
                    : SCHEDULE_STATUS_LABEL[session.status]}
                </span>
              </>
            );
            return (
              <li key={session.id} className="flex">
                {open ? (
                  <Link
                    href={`${applyHref}?category=${encodeURIComponent(group.key)}&programId=${session.id}`}
                    className={className}
                  >
                    {content}
                  </Link>
                ) : (
                  <span aria-disabled className={className}>
                    {content}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      ) : null}
      <p className={`text-body2b text-black ${selectable ? 'hidden' : 'mb-8'}`}>
        {first === last ? first : `${first} ~ ${last}`}
        {sessions.length > 1 && (
          <span className="text-gray-500"> · 총 {sessions.length}회</span>
        )}
      </p>
      {selectable ? null : isOpen ? (
        <Link
          href={`${applyHref}?category=${encodeURIComponent(group.key)}`}
          className="mt-auto rounded-sm bg-main-600 px-16 py-12 text-center text-body2b text-white"
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
