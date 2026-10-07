'use client';

import React, { useEffect, useState } from 'react';
import { EmptyExpoList, ExpoListItem, FormFilter } from '@/entities/exhibition';
import { withLoading } from '@/shared/hocs';
import { useExpoList, useExpoPage } from '@/shared/queries';
import { ExpoItem, OptionType } from '@/shared/types/main/type';
import { NavigationBar } from '@/shared/ui';
import { filterOptions } from '../../constant/filterOptions';
import { FormStatusData } from '../../model/FormStatusData';

const ExpoListContainer = () => {
  const [selectedFilter, setSelectedFilter] = useState<OptionType>({
    value: '필터',
    label: '필터',
    status: true,
  });
  // 폼 상태 필터는 전체 목록을 기준으로 거르므로 필터가 없을 때만 페이지로 조회합니다.
  const filtered = selectedFilter.value !== '필터';

  const { data: expoPage, isLoading: isPageFetching } = useExpoPage(!filtered);
  const { data: expoList, isLoading: isListFetching } = useExpoList(filtered);

  const [sortedExpoList, setSortedExpoList] = useState<ExpoItem[] | null>(null);

  useEffect(() => {
    if (!filtered || !expoList) return;
    setSortedExpoList(null);

    FormStatusData(expoList, selectedFilter.value, selectedFilter.status)
      .then((sorted) => setSortedExpoList(sorted))
      .catch((err) => {
        console.error('정렬 중 에러', err);
        setSortedExpoList([]);
      });
  }, [expoList, selectedFilter, filtered]);

  const displayLoading = filtered
    ? isListFetching || (expoList != null && sortedExpoList === null)
    : isPageFetching;
  const displayedExpoList = filtered ? sortedExpoList : expoPage?.content;

  return withLoading({
    isLoading: displayLoading,
    children: (
      <div className="flex w-full max-w-[1200px] flex-1 flex-col overflow-auto">
        <div className="mb-[30px] flex justify-between">
          <p className="text-h1m text-black">박람회 조회</p>
          <FormFilter
            options={filterOptions}
            selectedOption={selectedFilter}
            setSelectedOption={setSelectedFilter}
          />
        </div>

        {displayedExpoList && displayedExpoList.length > 0 ? (
          <div className="grid grid-cols-3 gap-x-36 gap-y-24 mobile:grid-cols-1">
            {displayedExpoList.map((item) => (
              <ExpoListItem
                key={item.id}
                id={item.id}
                coverImage={item.coverImage}
                title={item.title}
                description={item.description}
                startedDay={item.startedDay}
                finishedDay={item.finishedDay}
              />
            ))}
          </div>
        ) : (
          <EmptyExpoList />
        )}
        {!filtered && expoPage && (
          <div className="mt-[30px] flex justify-center">
            <NavigationBar totalPage={expoPage.totalPages} />
          </div>
        )}
      </div>
    ),
  });
};

export default ExpoListContainer;
