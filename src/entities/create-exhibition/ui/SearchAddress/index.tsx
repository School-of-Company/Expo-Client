// components/AddressSearch.tsx
'use client';

import { useEffect } from 'react';
import { Location } from '@/shared/assets/icons';

interface AddressData {
  address: string;
}

interface Props {
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
}

const AddressSearch: React.FC<Props> = ({ value, setValue }) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src =
      'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const openAddressSearch = () => {
    new window.daum.Postcode({
      oncomplete: (data: AddressData) => {
        setValue(data.address);
      },
    }).open();
  };

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
