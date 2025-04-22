// src/components/ExpoListContainer.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { ExpoListItem } from '@/entities/main';
import withLoading from '@/shared/hocs/withLoading';
import { useExpoList } from '@/shared/queries/useExpoList';
import { ExpoItem, FilterOption } from '@/shared/types/main/type';
import { FormStatusData } from '@/widgets/main/model/FormStatusData';
import { filterOptions } from '../../constant/filterOptions';
import EmptyExpoList from '../EmptyExpoList';
import FormFilter from '../FormFilter';

const ExpoListContainer = () => {
  const { data: expoList, isLoading: isFetching } = useExpoList();

  const [selectedFilter, setSelectedFilter] = useState<FilterOption>({
    value: '필터',
    label: '필터',
    status: true,
  });

  const [sortedExpoList, setSortedExpoList] = useState<ExpoItem[] | null>(null);

  useEffect(() => {
    if (!expoList) return;
    setSortedExpoList(null);

    FormStatusData(expoList, selectedFilter.value, selectedFilter.status)
      .then((sorted) => setSortedExpoList(sorted))
      .catch((err) => {
        console.error('정렬 중 에러', err);
        setSortedExpoList([]);
      });
  }, [expoList, selectedFilter]);

  const displayLoading =
    isFetching || (expoList != null && sortedExpoList === null);

  return withLoading({
    isLoading: displayLoading,
    children: (
      <div className="flex w-full max-w-[1200px] flex-1 flex-col overflow-auto">
        <div className="mb-[30px] flex justify-between">
          <p className="text-h1m text-black">박람회 신청</p>
          <FormFilter
            options={filterOptions}
            selectedOption={selectedFilter}
            setSelectedOption={setSelectedFilter}
          />
        </div>

        {sortedExpoList && sortedExpoList.length > 0 ? (
          <div className="grid grid-cols-3 gap-x-36 gap-y-24 mobile:grid-cols-1">
            {sortedExpoList.map((item) => (
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
      </div>
    ),
  });
};

export default ExpoListContainer;
