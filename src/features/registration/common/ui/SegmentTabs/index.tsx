interface SegmentTabsProps<T extends string> {
  ariaLabel: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}

/** 한 화면 안에서 보기를 바꾸는 탭(날짜·구분 등). 체크인 처리 모드 버튼과 같은 모양 */
const SegmentTabs = <T extends string>({
  ariaLabel,
  value,
  options,
  onChange,
}: SegmentTabsProps<T>) => (
  <div role="tablist" aria-label={ariaLabel} className="flex flex-wrap gap-8">
    {options.map((option) => {
      const isSelected = option.value === value;
      return (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={isSelected}
          onClick={() => onChange(option.value)}
          className={`rounded-sm border-1 border-solid px-20 py-8 text-body2b mobile:px-12 mobile:text-caption1b ${
            isSelected
              ? 'border-main-600 bg-main-600 text-white'
              : 'border-gray-200 text-gray-500'
          }`}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);

export default SegmentTabs;
