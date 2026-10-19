import Link from 'next/link';
import {
  ScheduleStatus,
  SCHEDULE_STATUS_LABEL,
} from '../../model/applicationSchedule';

const STATUS_CLASS: Record<ScheduleStatus, string> = {
  UPCOMING: 'bg-main-100 text-main-600',
  OPEN: 'bg-main-600 text-white',
  CLOSED: 'bg-gray-100 text-gray-500',
  ENDED: 'bg-gray-100 text-gray-400',
  UNSET: 'bg-gray-100 text-gray-500',
};

/** 신청 목록의 회차·신청서 한 줄. 접수 중일 때만 신청 버튼을 보인다 */
const ScheduleRow = ({
  category,
  title,
  schedule,
  place,
  notes,
  status,
  action,
}: {
  category?: string;
  title: string;
  /** 설문처럼 신청 기간이 없으면 비운다 */
  schedule?: string;
  place: string | null;
  notes: string[];
  status: ScheduleStatus;
  action?: { href: string; label: string };
}) => (
  <li className="flex items-start justify-between gap-16 rounded-sm border-1 border-solid border-gray-200 bg-white p-24 mobile:flex-col mobile:gap-12 mobile:p-16">
    <div className="flex min-w-0 flex-col gap-4">
      {category && <p className="text-caption1r text-main-600">{category}</p>}
      <div className="flex flex-wrap items-center gap-8">
        <span
          className={`rounded-full px-12 py-4 text-caption1b ${STATUS_CLASS[status]}`}
        >
          {SCHEDULE_STATUS_LABEL[status]}
        </span>
        <p className="break-keep text-body1b text-black mobile:text-body2b">
          {title}
        </p>
      </div>
      {schedule && <p className="text-body2r text-gray-600">{schedule}</p>}
      {place && (
        <p className="break-words break-keep text-body2r text-gray-500">
          장소: {place}
        </p>
      )}
      {notes.map((note) => (
        <p
          key={note}
          className="whitespace-pre-line break-keep text-caption1r text-gray-500"
        >
          {note}
        </p>
      ))}
    </div>
    {action && (
      <Link
        href={action.href}
        className="flex-none rounded-sm bg-main-600 px-20 py-10 text-body2b text-white mobile:w-full mobile:text-center"
      >
        {action.label}
      </Link>
    )}
  </li>
);

export default ScheduleRow;
