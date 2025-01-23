'use client';

import React, { useState, useMemo, ChangeEvent } from 'react';
import { SearchTab } from '@/entities/expo-manage';
import withLoading from '@/shared/hocs/withLoading';
import { fileActions } from '@/shared/model/footerActions';
import { Participant, Trainee } from '@/shared/types/expo-manage/type';
import SelectUserType from '@/shared/ui/SelectUserType';
import { TableForm } from '@/shared/ui/Table';
import { category, selectOptionCategories } from '../../model/category';
import { useExpoManageQueries } from '../../model/useExpoData';

const ExpoManageForm = ({ id }: { id: string }) => {
  const [selectOption, setSelectOption] = useState<string>('trainee');
  const [searchInputText, setSearchInputText] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');

  const { expoQueries, isLoading } = useExpoManageQueries(
    id,
    selectOption,
    searchText,
  );

  const requestPrintCategories = useMemo(() => {
    return category(selectOption);
  }, [selectOption]);

  const expoData = expoQueries.data || [];

  const onChangeSearchInput = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchInputText(e.target.value);
  };

  const handleSearch = () => {
    setSearchText(searchInputText);
  };

  return withLoading({
    isLoading,
    children: (
      <div className="mx-auto w-full max-w-[1200px] space-y-[30px] px-5">
        <SelectUserType
          options={selectOptionCategories}
          value={selectOption}
          onChange={(value) => setSelectOption(value)}
          setSearchText={setSearchText}
          setSearchInputText={setSearchInputText}
        />
        <SearchTab
          searchInputText={searchInputText}
          onChangeSearchInput={onChangeSearchInput}
          handleSearch={handleSearch}
        />
        <TableForm<Trainee | Participant>
          categories={requestPrintCategories}
          data={expoData}
          maxHeight="414px"
          footerType="file"
          text="참가자 전체 인원"
          actions={fileActions(id)}
        />
      </div>
    ),
  });
};

export default ExpoManageForm;
