'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { usePreregisterSessions } from '@/features/registration/common';
import { withLoading } from '@/shared/hocs';
import { toKstLocal } from '@/shared/libs/kstDateTime';
import { useExcelDownload } from '@/shared/model';
import { useExpoDetail } from '@/shared/queries/useExpoDetail';
import {
  participants,
  ParticipantResponse,
  Trainee,
  TraineeResponse,
} from '@/shared/types/exhibition/participants/type';
import { SearchInput } from '@/shared/ui/SearchInput';
import SelectUserType from '@/shared/ui/SelectUserType';
import { TableForm } from '@/shared/ui/Table';
import { clampPage } from '../../lib/clampPage';
import { category, selectOptionCategories } from '../../model/category';
import { useExpoManageQueries } from '../../model/useExpoData';
import DateContainer from '../DateContainer';

const FIELD_TAB_PREFIX = 'field-';

/** 행사 기간의 날짜들(yyyy-MM-dd). startedDay·finishedDay 는 KST 날짜라 앞 10자리만 쓴다 */
const getExpoDays = (startedDay: string, finishedDay: string) => {
  const days: string[] = [];
  const end = new Date(`${finishedDay.slice(0, 10)}T00:00:00Z`).getTime();
  for (
    let day = new Date(`${startedDay.slice(0, 10)}T00:00:00Z`);
    day.getTime() <= end;
    day.setUTCDate(day.getUTCDate() + 1)
  )
    days.push(day.toISOString().slice(0, 10));
  return days;
};

const ParticipantTable = ({ id }: { id: string }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const userType = searchParams.get('userType') || 'STANDARD';
  const navigation = searchParams.get('navigation') || 'standard';
  const isProgram = navigation === 'program';

  const isTrainee = userType === 'TRAINEE';

  const { data: sessions = [], isLoading: sessionsLoading } =
    usePreregisterSessions(id);

  // 현장등록 입장은 회차가 없어 행사 날짜별 탭으로 따로 본다. 회차 시간 밖에 들어온 사전등록자도 여기에 나온다(Expo-User-Server#191)
  const { data: expo } = useExpoDetail(id);
  const fieldDays = useMemo(
    () => (expo ? getExpoDays(expo.startedDay, expo.finishedDay) : []),
    [expo],
  );

  // 탭은 사전등록 회차 이름과 날짜별 현장등록이다. 회차 입장자는 회차 ID로 조회하고, 날짜는 서버가 sessionId 가 있으면 무시한다
  const tabs = [
    ...sessions.map((s) => ({ key: String(s.id), label: s.title })),
    ...fieldDays.map((day) => ({
      key: `${FIELD_TAB_PREFIX}${day}`,
      label: `${Number(day.slice(5, 7))}/${Number(day.slice(8, 10))} 현장등록`,
    })),
  ];
  const [selectedTabKey, setSelectedTabKey] = useState<string>();
  const selectedTab = tabs.find(({ key }) => key === selectedTabKey) ?? tabs[0];
  const selectedFieldDay = selectedTab?.key.startsWith(FIELD_TAB_PREFIX)
    ? selectedTab.key.slice(FIELD_TAB_PREFIX.length)
    : undefined;
  const selectedSession = selectedFieldDay
    ? undefined
    : sessions.find((s) => String(s.id) === selectedTab?.key);
  const selectedDate =
    selectedFieldDay ??
    (selectedSession
      ? toKstLocal(selectedSession.startedAt).slice(0, 10)
      : undefined);
  const [selectItem, setSelectItem] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { mutate: downloadExcel, isPending: isExporting } = useExcelDownload();

  const { expoManageQueries, isLoading: expoManageLoading } =
    useExpoManageQueries(
      id,
      userType,
      page,
      selectedDate || '',
      Boolean(selectedDate),
      selectedSession?.id,
      Boolean(selectedFieldDay),
    );

  const requestPrintCategories = useMemo(() => {
    return category(userType);
  }, [userType]);

  const expoData = expoManageQueries.data;

  // 연수자는 전체 목록 배열, 일반 참가자는 회차별 페이지 응답이다
  const participantsData: (Trainee | participants)[] =
    (isTrainee
      ? (expoData as TraineeResponse | undefined)
      : (expoData as ParticipantResponse | undefined)?.participants) ?? [];

  const totalPage = isTrainee
    ? 1
    : ((expoData as ParticipantResponse | undefined)?.info?.totalPage ?? 1);

  // 일반 참가자는 선택 회차 입장자 전체 건수, 연수자는 행사 전체 연수자 수
  const attendeeCount = (expoData as ParticipantResponse | undefined)?.info
    ?.totalElement;
  const isSearching = Boolean(searchQuery.trim());

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

  const replacePage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(nextPage));
    router.replace(`?${params.toString()}`);
  };

  // 탭마다 입장자 수가 달라 page 를 이어 가면 범위를 벗어난 빈 목록이 나온다
  const handleTabSelect = (key: string) => {
    setSelectedTabKey(key);
    if (page !== 1) replacePage(1);
  };

  // 그래도 범위를 벗어난 page(직접 입력한 URL 등)는 응답의 totalPage 로 마지막 페이지로 보정한다
  const hasPageData = Boolean(expoData) && !isTrainee;
  const safePage = clampPage(page, totalPage);
  useEffect(() => {
    if (hasPageData && page !== safePage) replacePage(safePage);
  });

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
    isLoading: expoManageLoading || (!isTrainee && sessionsLoading),
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
            items={tabs}
            onSelect={handleTabSelect}
            selectedKey={selectedTab?.key ?? ''}
          />
        )}
        {!isTrainee && (
          <p className="text-caption1r text-gray-500">
            {selectedFieldDay
              ? '선택한 날짜에 회차 없이 입장한 참가자입니다. 현장등록 입장 외에 회차 시간 밖에 들어온 사전등록자도 포함되며, 같은 날 회차로도 입장했다면 그 회차 탭에도 나옵니다.'
              : sessions.length === 0
                ? '등록된 사전등록 회차가 없습니다. 신청 관리에서 회차를 먼저 추가해주세요.'
                : '선택한 회차로 입장한 참가자입니다. 회차 기록이 없는 예전 입장분은 보이지 않습니다. 사전등록한 전체 신청자는 접수대장에서 확인할 수 있습니다.'}
          </p>
        )}

        {/* Excel 은 화면의 회차·날짜·검색 조건을 보내지 않는 별도 명단이라 무엇을 받는지 미리 알린다 */}
        <p className="text-caption1r text-gray-500">
          {!isTrainee
            ? '아래 Excel은 선택한 회차·날짜·검색과 상관없이 행사 전체 일반 참가자 명단입니다. 회차별 실제 출석은 일정 관리의 출석결과 엑셀로, 신청 원장은 접수대장에서 받습니다.'
            : isProgram
              ? '아래 Excel은 행사 전체 연수자와 신청 강연 명단입니다. 검색 조건은 반영되지 않습니다.'
              : '목록에서 연수자 1명을 선택해 Excel을 누르면 그 연수자의 수기 출석부(작성용 서식)를 받습니다. 실제 출석 결과가 아닙니다.'}
        </p>

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
            // 이 목록은 사전등록 전체가 아니라 선택 회차·날짜로 입장한 참가자다. 검색은 현재 페이지에서만 거른다
            text={
              isSearching
                ? '현재 페이지 검색 결과'
                : `${selectedTab?.label ?? ''} 입장자 수`
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
