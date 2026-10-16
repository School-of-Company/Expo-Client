interface TitleTabsProps<T extends string> {
  ariaLabel: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}

/** 화면 맨 위에서 큰 글자로 영역을 오가는 탭. 프로그램(일반·연수), 만족도 조사·경품 추첨이 같은 모양을 쓴다 */
const TitleTabs = <T extends string>({
  ariaLabel,
  value,
  options,
  onChange,
}: TitleTabsProps<T>) => (
  <div
    role="tablist"
    aria-label={ariaLabel}
    className="flex flex-wrap justify-center gap-x-[18px] gap-y-8"
  >
    {options.map((option) => {
      const isSelected = option.value === value;
      return (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={isSelected}
          className={`text-h2b mobile:text-body1b ${
            isSelected ? 'text-black' : 'text-gray-500'
          }`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      );
    })}
  </div>
);

export default TitleTabs;
