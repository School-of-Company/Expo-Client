'use client';

import React from 'react';
import { Location } from '@/shared/assets/icons';
import { useAddressSearch } from '../../model/useAddressSearch';

interface Props {
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
}

const AddressSearch = ({ value, setValue }: Props) => {
  const { openAddressSearch } = useAddressSearch(setValue);

  return (
    <div className="space-y-[10px]">
      <input
        className="flex w-full rounded-sm border-1 border-solid border-gray-200 px-6 py-5 duration-200"
        type="text"
        placeholder="주소를 입력하세요"
        value={value}
        readOnly
      />
      <div className="flex justify-end">
        <button
          className="flex gap-[10px] text-body2 text-gray-500"
          onClick={openAddressSearch}
        >
          <Location />
          위치 찾기
        </button>
      </div>
    </div>
  );
};

export default AddressSearch;
