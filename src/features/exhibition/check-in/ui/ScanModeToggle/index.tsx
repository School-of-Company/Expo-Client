export type ScanMode = 'entry' | 'exit';

// 선택한 모드를 멀리서도 구분하도록 퇴장은 다른 색으로 채운다
const MODES: { value: ScanMode; label: string; selectedClass: string }[] = [
  {
    value: 'entry',
    label: '입장',
    selectedClass: 'border-main-600 bg-main-600 text-white',
  },
  {
    value: 'exit',
    label: '퇴장',
    selectedClass: 'border-error bg-error text-white',
  },
];

/** 스캔한 QR 을 입장으로 처리할지 퇴장으로 처리할지 고른다 */
const ScanModeToggle = ({
  mode,
  onChange,
}: {
  mode: ScanMode;
  onChange: (mode: ScanMode) => void;
}) => (
  <div role="radiogroup" aria-label="처리 모드" className="flex gap-8">
    {MODES.map(({ value, label, selectedClass }) => {
      const isSelected = mode === value;
      return (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={isSelected}
          onClick={() => onChange(value)}
          className={`rounded-sm border-1 border-solid px-20 py-8 text-body2b ${
            isSelected
              ? selectedClass
              : 'border-gray-200 bg-white text-gray-400'
          }`}
        >
          {isSelected && <span aria-hidden>✓ </span>}
          {label}
        </button>
      );
    })}
  </div>
);

export default ScanModeToggle;
