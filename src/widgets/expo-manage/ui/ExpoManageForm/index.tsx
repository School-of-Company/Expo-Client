'use client';

import React, { useEffect, useState, useMemo } from 'react';
import withLoading from '@/shared/hocs/withLoading';
import { fileActions } from '@/shared/model/footerActions';
import { Participant, Trainee } from '@/shared/types/expo-manage/type';
import SelectUserType from '@/shared/ui/SelectUserType';
import { TableForm } from '@/shared/ui/Table';
import { category, selectOptionCategories } from '../../model/category';
import { useExpoManageQueries } from '../../model/useExpoData';

const ExpoManageForm = ({ id }: { id: string }) => {
  const [selectOption, setSelectOption] = useState<string>('trainee');
  const [resetKey, setResetKey] = useState(0);

  const { expoQueries, isLoading } = useExpoManageQueries(id, selectOption);

  const requestPrintCategories = useMemo(() => {
    return category(selectOption);
  }, [selectOption]);

  useEffect(() => {
    setResetKey((prevKey) => prevKey + 1);
  }, [selectOption]);

  const expoData = expoQueries.data || [];

  return withLoading({
    isLoading,
    children: (
      <div className="mx-auto w-full max-w-[1200px] space-y-[30px] px-5">
        <SelectUserType
          options={selectOptionCategories}
          defaultValue="trainee"
          onChange={(value) => setSelectOption(value)}
        />
        <TableForm<Trainee | Participant>
          key={resetKey}
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
