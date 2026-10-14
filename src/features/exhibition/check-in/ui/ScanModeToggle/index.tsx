export type ScanMode = 'entry' | 'exit';

const MODES: { value: ScanMode; label: string }[] = [
  { value: 'entry', label: '입장' },
  { value: 'exit', label: '퇴장' },
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
    {MODES.map(({ value, label }) => {
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
              ? 'border-main-600 bg-main-600 text-white'
              : 'border-gray-200 text-gray-500'
          }`}
        >
          {label}
        </button>
      );
    })}
  </div>
);

export default ScanModeToggle;
