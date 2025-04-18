'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useMemo, useEffect, useState } from 'react';
import withLoading from '@/shared/hocs/withLoading';
import { fileActions } from '@/shared/model/footerActions';
import {
  participants,
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const userType = searchParams.get('userType') || 'TRAINEE';

  const isTrainee = userType === 'TRAINEE';

  const { data: expoDetailQuery, isLoading: expoDetailLoading } =
    useGetExpoDetailQuery(id);

  const [selectedDate, setSelectedDate] = useState<string | undefined>(
    undefined,
  );

  useEffect(() => {
    if (expoDetailQuery?.startedDay && selectedDate === undefined) {
      setSelectedDate(expoDetailQuery.startedDay);
    }
  }, [expoDetailQuery?.startedDay]);

  const { expoManageQueries, isLoading: expoManageLoading } =
    useExpoManageQueries(
      id,
      userType,
      page,
      selectedDate || '',
      Boolean(selectedDate),
    );

  const requestPrintCategories = useMemo(() => {
    return category(userType);
  }, [userType]);

  const expoData = expoManageQueries.data;
  const totalPage = expoData?.info?.totalPage ?? 1;

  const handleSlectUserChange = (newValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('userType', newValue);
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  return withLoading({
    isLoading: expoManageLoading || !selectedDate || expoDetailLoading,
    children: (
      <div className="flex w-full max-w-[1200px] flex-1 flex-col space-y-30 overflow-y-auto">
        <SelectUserType
          options={selectOptionCategories}
          value={userType}
          onChange={handleSlectUserChange}
        />

        <DateContainer
          startedDay={expoDetailQuery?.startedDay || ''}
          finishedDay={expoDetailQuery?.finishedDay || ''}
          onDateSelect={setSelectedDate}
          selectedDate={selectedDate || ''}
        />

        {isTrainee ? (
          <TableForm<Trainee>
            categories={requestPrintCategories}
            data={(expoData as TraineeResponse)?.participants ?? []}
            maxHeight="414px"
            footerType="file"
            text="전체 인원"
            actions={fileActions(id, '/excel')}
            totalPage={totalPage}
            id={id}
            selectItemBoolean={false}
          />
        ) : (
          <TableForm<participants>
            categories={requestPrintCategories}
            data={(expoData as ParticipantResponse)?.participants ?? []}
            maxHeight="414px"
            footerType="file"
            text="전체 인원"
            actions={fileActions(id, '/excel/standard')}
            totalPage={totalPage}
            id={id}
            selectItemBoolean={false}
          />
        )}
      </div>
    ),
  });
};

export default ExpoManageForm;
