'use client';

import { useSearchParams } from 'next/navigation';
import React, { useState, useMemo, useEffect } from 'react';
import withLoading from '@/shared/hocs/withLoading';
import { fileActions } from '@/shared/model/footerActions';
import {
  Participant,
  ParticipantResponse,
  Trainee,
  TraineeResponse,
} from '@/shared/types/expo-manage/type';
import SelectUserType from '@/shared/ui/SelectUserType';
import { TableForm } from '@/shared/ui/Table';
import { category, selectOptionCategories } from '../../model/category';
import { useExpoManageQueries } from '../../model/useExpoData';
import { useGetExpoDetailQuery } from '../../model/useExpoDetailQuery';
import DateContainer from '../DateContainer';

const ExpoManageForm = ({ id }: { id: string }) => {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;

  const { data: expoDetailQuery, isLoading: expoDetailLoading } =
    useGetExpoDetailQuery(id);

  const [selectOption, setSelectOption] = useState<string>('trainee');
  const [selectedDate, setSelectedDate] = useState<string | undefined>(
    undefined,
  );

  useEffect(() => {
    if (expoDetailQuery?.startedDay && selectedDate === undefined) {
      setSelectedDate(expoDetailQuery.startedDay);
    }
  }, [expoDetailQuery?.startedDay]);

  const { expoManageQueries, isLoading: expoManageLoading } =
    useExpoManageQueries(id, selectOption, page, selectedDate || '');

  const requestPrintCategories = useMemo(() => {
    return category(selectOption);
  }, [selectOption]);

  const expoData = expoManageQueries.data;
  const totalPage = expoData?.info?.totalPage ?? 1;

  return withLoading({
    isLoading: expoManageLoading || !selectedDate || expoDetailLoading,
    children: (
      <div className="mx-auto w-full max-w-[1200px] space-y-[29px] px-5">
        <SelectUserType
          options={selectOptionCategories}
          value={selectOption}
          onChange={(value) => setSelectOption(value)}
        />

        <DateContainer
          startedDay={expoDetailQuery?.startedDay || ''}
          finishedDay={expoDetailQuery?.finishedDay || ''}
          onDateSelect={setSelectedDate}
          selectedDate={selectedDate || ''}
        />

        {selectOption === 'trainee' ? (
          <TableForm<Trainee>
            categories={requestPrintCategories}
            data={(expoData as TraineeResponse)?.participant ?? []}
            maxHeight="414px"
            footerType="file"
            text="참가자 전체 인원"
            actions={fileActions(id)}
            totalPage={totalPage}
            id={id}
          />
        ) : (
          <TableForm<Participant>
            categories={requestPrintCategories}
            data={(expoData as ParticipantResponse)?.participant ?? []}
            maxHeight="414px"
            footerType="file"
            text="참가자 전체 인원"
            actions={fileActions(id)}
            totalPage={totalPage}
            id={id}
          />
        )}
      </div>
    ),
  });
};

export default ExpoManageForm;
