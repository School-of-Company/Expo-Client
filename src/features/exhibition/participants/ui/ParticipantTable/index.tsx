'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useMemo, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { withLoading } from '@/shared/hocs';
import { useExcelDownload } from '@/shared/model';
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
import { category, selectOptionCategories } from '../../model/category';
import { useExpoManageQueries } from '../../model/useExpoData';
import DateContainer from '../DateContainer';

const ParticipantTable = ({ id }: { id: string }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const userType = searchParams.get('userType') || 'STANDARD';
  const navigation = searchParams.get('navigation') || 'standard';
  const isProgram = navigation === 'program';

  const isTrainee = userType === 'TRAINEE';

  const { data: expoDetailQuery, isLoading: expoDetailLoading } =
    useExpoDetail(id);

  const [selectedDate, setSelectedDate] = useState<string | undefined>(
    undefined,
  );
  const [selectItem, setSelectItem] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { mutate: downloadExcel, isPending: isExporting } = useExcelDownload();

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

  // 연수자는 전체 목록 배열, 일반 참가자는 날짜별 페이지 응답이다
  const participantsData: (Trainee | participants)[] =
    (isTrainee
      ? (expoData as TraineeResponse | undefined)
      : (expoData as ParticipantResponse | undefined)?.participants) ?? [];

  const totalPage = isTrainee
    ? 1
    : ((expoData as ParticipantResponse | undefined)?.info?.totalPage ?? 1);

  // 일반 참가자는 선택일 입장자 전체 건수, 연수자는 행사 전체 연수자 수
  const attendeeCount = (expoData as ParticipantResponse | undefined)?.info
    ?.totalElement;
  const isSearching = Boolean(searchQuery.trim());
  const formatDay = (date?: string) =>
    date ? date.replace(/^\d{4}-(\d{2})-(\d{2})$/, '$1.$2') : '';

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
    exportExcel: (selectedRowId: number) => {
      if (isProgram) {
        // 프로그램 탭은 행사 전체 연수자와 신청 강연을 담은 교원 연수자 명단을 받는다
        downloadExcel({ path: `/excel/${id}` });
        return;
      }

      if (!isTrainee) {
        toast.error('연수자 정보를 확인할 수 없습니다.');
        return;
      }

      downloadExcel({ path: `/excel/trainee/${selectedRowId}` });
    },
  };
  const standardExcelFile = {
    exportExcel: () => downloadExcel({ path: `/excel/standard/${id}` }),
  };

  return withLoading({
    isLoading:
      expoManageLoading || (!isTrainee && !selectedDate) || expoDetailLoading,
    children: (
      <div className="flex w-full max-w-[1200px] flex-1 flex-col space-y-30 overflow-y-auto">
        <SelectUserType
          options={selectOptionCategories}
          value={userType}
          onChange={handleSlectUserChange}
        />

        {/* 연수자 목록은 날짜 구분 없이 행사 전체라 날짜 선택을 보여 주지 않는다 */}
        {!isTrainee && (
          <DateContainer
            startedDay={expoDetailQuery?.startedDay || ''}
            finishedDay={expoDetailQuery?.finishedDay || ''}
            onDateSelect={setSelectedDate}
            selectedDate={selectedDate || ''}
          />
        )}
        {!isTrainee && (
          <p className="text-caption1r text-gray-500">
            선택한 날짜에 입장한 참가자입니다. 사전등록한 전체 신청자는
            접수대장에서 확인할 수 있습니다.
          </p>
        )}

        <SearchInput
          label="이름, 연락처, 연수번호 검색"
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
            text={isSearching ? '검색 결과' : '연수자 전체 인원'}
            actions={traineeExcelFile}
            totalPage={totalPage}
            id={id}
            selectItemBoolean={!isProgram}
            setSelectItem={setSelectItem}
            selectItem={selectItem}
            isExporting={isExporting}
          />
        ) : (
          <TableForm<participants>
            categories={requestPrintCategories}
            data={filteredData as participants[]}
            maxHeight="414px"
            footerType="file"
            // 이 목록은 사전등록 전체가 아니라 선택일에 입장한 참가자다. 검색은 현재 페이지에서만 거른다
            text={
              isSearching
                ? '현재 페이지 검색 결과'
                : `${formatDay(selectedDate)} 입장자 수`
            }
            totalCount={isSearching ? undefined : attendeeCount}
            actions={standardExcelFile}
            totalPage={totalPage}
            id={id}
            selectItemBoolean={false}
            isExporting={isExporting}
          />
        )}
      </div>
    ),
  });
};

export default ParticipantTable;
