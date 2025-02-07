import React from 'react';
import { Search } from '@/shared/assets/icons';
import { Input } from '@/shared/ui';

interface Props {
  onChangeSearchInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  searchInputText: string;
  handleSearch: () => void;
}

const SearchTab = ({
  onChangeSearchInput,
  searchInputText,
  handleSearch,
}: Props) => {
  return (
    <div className="flex w-full items-center gap-[10px]">
      <Input
        placeholder="검색할 내용을 입력해주세요."
        onChange={onChangeSearchInput}
        value={searchInputText ?? ''}
      />
      <button onClick={handleSearch}>
        <Search />
      </button>
    </div>
  );
};

export default SearchTab;
