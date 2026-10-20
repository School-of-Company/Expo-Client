'use client';

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** ISO 8601 → 'YYYY-MM-DDTHH:mm'(한국 시각). datetime-local 값이다 */
const toKstLocal = (value: Date | null) =>
  value && Number.isFinite(value.getTime())
    ? new Date(value.getTime() + KST_OFFSET_MS).toISOString().slice(0, 16)
    : '';

/** 달력 아이콘만이 아니라 칸 어디를 눌러도 날짜 선택을 연다. 지원하지 않는 브라우저는 기본 동작 그대로다. */
const openPicker = (e: React.MouseEvent<HTMLInputElement>) => {
  try {
    e.currentTarget.showPicker?.();
  } catch {
    // 사용자 동작이 아니라고 판단되면 던진다. 기본 입력은 그대로 쓸 수 있다
  }
};

interface Props {
  value: Date | null;
  onChange: (value: Date | null) => void;
  label: string;
}

/** 날짜·시·분을 한국 시각으로 받는다. 브라우저 시간대와 상관없이 같은 순간이 된다 */
const KstDateTimeInput = ({ value, onChange, label }: Props) => (
  <input
    type="datetime-local"
    aria-label={label}
    value={toKstLocal(value)}
    onClick={openPicker}
    onChange={(e) =>
      onChange(e.target.value ? new Date(`${e.target.value}:00+09:00`) : null)
    }
    className="text-body4 w-full cursor-pointer rounded-sm border-1 border-solid border-gray-200 px-16 py-12 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
  />
);

export default KstDateTimeInput;
