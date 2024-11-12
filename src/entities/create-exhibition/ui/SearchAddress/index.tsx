import React from 'react';
import { UseFormSetValue, UseFormRegisterReturn } from 'react-hook-form';
import { Location } from '@/shared/assets/icons';
import { Input } from '@/shared/ui';
import { ExhibitionFormData } from '@/widgets/create-exhibition/types/type';
import { useAddressSearch } from '../../model/useAddressSearch';

interface Props {
  register: UseFormRegisterReturn;
  setValue: UseFormSetValue<ExhibitionFormData>;
}

const AddressSearch = ({ setValue, register }: Props) => {
  const { openAddressSearch } = useAddressSearch(setValue);

  return (
    <div className="space-y-[10px]">
      <Input {...register} placeholder="주소를 입력해주세요." readOnly />
      <div className="flex justify-end">
        <button
          type="button"
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
