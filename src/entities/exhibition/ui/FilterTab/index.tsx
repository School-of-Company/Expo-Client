import { ArrowDown, FilterIcon } from '@/shared/assets/icons';

const FilterTab = () => {
  return (
    <div className="flex justify-between">
      <div className="flex items-center gap-6">
        <p className="text-balck text-h2">사전 행사참가자</p>
        <ArrowDown />
      </div>
      <button
        type="button"
        className="whitespace-nowrap rounded-sm bg-main-600 px-[14px] py-[6px]"
      >
        <div className="text-caption2 flex items-center gap-[10px] text-white">
          <FilterIcon fill="#fff" />
          필터
        </div>
      </button>
    </div>
  );
};

export default FilterTab;
