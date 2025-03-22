'use client';

import { useMemo, useState } from 'react';
import { ExpoListItem, ExpoListSelect } from '@/entities/main';
import withLoading from '@/shared/hocs/withLoading';
import { ExpoItem } from '@/shared/types/main/type';
import { filterOptions } from '../../constant/filterOptions';
import { sortExpoList } from '../../model/sortedExpoList';
import { useExpoList } from '../../model/useExpoList';

const ExpoListContainer = () => {
  const { data: expoList, isLoading } = useExpoList();
  const [selectedFilter, setSelectedFilter] = useState(filterOptions[0]);

  const sortedExpoList = useMemo<ExpoItem[]>(
    () => sortExpoList(expoList, selectedFilter.value),
    [expoList, selectedFilter.value],
  );

  return withLoading({
    isLoading,
    children: (
      <>
        <div className="mb-[30px] flex justify-between">
          <p className="text-h1m text-black">박람회 신청</p>
          <ExpoListSelect
            options={filterOptions}
            selectedOption={selectedFilter}
            setSelectedOption={setSelectedFilter}
          />
        </div>

        <div className="grid grid-cols-3 gap-x-36 gap-y-24 mobile:grid-cols-1">
          {sortedExpoList?.map((item, index) => (
            <ExpoListItem
              id={item.id}
              coverImage={item.coverImage}
              key={index}
              title={item.title}
              description={item.description}
              startedDay={item.startedDay}
              finishedDay={item.finishedDay}
            />
          ))}
        </div>
      </>
    ),
  });
};

export default ExpoListContainer;
