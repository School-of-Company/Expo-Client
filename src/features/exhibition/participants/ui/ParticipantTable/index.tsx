'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useMemo, useEffect, useState } from 'react';
import { withLoading } from '@/shared/hocs';
import { useExpoDetail } from '@/shared/queries';
import {
  participants,
  ParticipantResponse,
  Trainee,
  TraineeResponse,
} from '@/shared/types/exhibition/participants/type';
import { SearchInput } from '@/shared/ui/SearchInput';
import SelectUserType from '@/shared/ui/SelectUserType';
import { TableForm } from '@/shared/ui/Table';
import { getClassExcelFile } from '../../api/getClassExcelFile';
import { getStandardExcelFile } from '../../api/getStandardExcelFile';
import { getTraineeExcelFile } from '../../api/getTraineeExcelFile';
import { category, selectOptionCategories } from '../../model/category';
import { useExpoManageQueries } from '../../model/useExpoData';
import DateContainer from '../DateContainer';

const ParticipantTable = ({ id }: { id: string }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const userType = searchParams.get('userType') || 'STANDARD';
  const isProgram = searchParams.get('navigation') || false;

  const isTrainee = userType === 'TRAINEE';

  const { data: expoDetailQuery, isLoading: expoDetailLoading } =
    useExpoDetail(id);

  const [selectedDate, setSelectedDate] = useState<string | undefined>(
    undefined,
  );
  const [selectItem, setSelectItem] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  const participantsData = Array.isArray(expoData)
    ? expoData
    : ((isTrainee
        ? (expoData as TraineeResponse)?.participants
        : (expoData as ParticipantResponse)?.participants) ?? []);

  const totalPage = Array.isArray(expoData)
    ? 1
    : (expoData?.info?.totalPage ?? 1);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return participantsData;

    const normalizedQuery = searchQuery.toLowerCase().trim();

    return participantsData.filter((participant) => {
      const name = (participant.name || '').toLowerCase();
      const phoneNumber = (participant.phoneNumber || '').replace(/-/g, '');
      const searchPhone = normalizedQuery.replace(/-/g, '');

      if (isTrainee) {
        const trainee = participant as Trainee;
        const trainingId = (trainee.trainingId || '').toLowerCase();
        return (
          name.includes(normalizedQuery) ||
          phoneNumber.includes(searchPhone) ||
          trainingId.includes(normalizedQuery)
        );
      } else {
        return (
          name.includes(normalizedQuery) || phoneNumber.includes(searchPhone)
        );
      }
    });
  }, [participantsData, searchQuery, isTrainee]);

  const handleSlectUserChange = (newValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('userType', newValue);
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const traineeExcelFile = {
    exportExcel: () =>
      isProgram ? getClassExcelFile(id) : getTraineeExcelFile(id),
  };
  const standardExcelFile = {
    exportExcel: () => getStandardExcelFile(id),
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

        <SearchInput
          placeholder="이름, 연락처, 연수번호로 검색"
          value={searchQuery}
          onChange={setSearchQuery}
        />

        {isTrainee ? (
          <TableForm<Trainee>
            categories={requestPrintCategories}
            data={filteredData as Trainee[]}
            maxHeight="414px"
            footerType="file"
            text="참가자 전체 인원"
            actions={traineeExcelFile}
            totalPage={totalPage}
            id={id}
            selectItemBoolean={false}
            setSelectItem={setSelectItem}
            selectItem={selectItem}
          />
        ) : (
          <TableForm<participants>
            categories={requestPrintCategories}
            data={filteredData as participants[]}
            maxHeight="414px"
            footerType="file"
            text="참가자 전체 인원"
            actions={standardExcelFile}
            totalPage={totalPage}
            id={id}
            selectItemBoolean={false}
          />
        )}
      </div>
    ),
  });
};

export default ParticipantTable;
