export type StatusBadgeTone = 'main' | 'gray' | 'error' | 'outline';

const TONE_STYLE: Record<StatusBadgeTone, string> = {
  main: 'bg-main-100 text-main-600',
  gray: 'bg-gray-100 text-gray-500',
  error: 'bg-[#fdecec] text-error',
  outline: 'border-1 border-solid border-gray-200 text-gray-500',
};

/** 상태·구분을 표 안에서 짧게 보여 주는 배지 */
const StatusBadge = ({
  tone = 'gray',
  children,
}: {
  tone?: StatusBadgeTone;
  children: React.ReactNode;
}) => (
  <span
    className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-8 py-2 text-caption2b ${TONE_STYLE[tone]}`}
  >
    {children}
  </span>
);

export default StatusBadge;
