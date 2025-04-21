'use client';

import { useEffect, useState } from 'react';
import { ExpoListItem } from '@/entities/main';
import withLoading from '@/shared/hocs/withLoading';
import { filterOptions } from '../../constant/filterOptions';
import { useExpoList } from '../../model/useExpoList';
import EmptyExpoList from '../EmptyExpoList';
import FormFilter from '../FormFilter';
import { ExpoItem } from '@/shared/types/main/type';
import { FormStatusData } from '@/widgets/main/model/FormStatusData';

const ExpoListContainer = () => {
  const { data: expoList, isLoading } = useExpoList();
  const [selectedFilter, setSelectedFilter] = useState({
    value: '필터',
    label: '필터',
    status: true,
  });
  const [sortedExpoList, setSortedExpoList] = useState<ExpoItem[]>([]);

  useEffect(() => {
    const fetchSortedExpoList = async () => {
      if (expoList) {
        const sortedList = await FormStatusData(
          expoList || [],
          selectedFilter.value,
          selectedFilter.status,
        );
        setSortedExpoList(sortedList);
      }
    };
    fetchSortedExpoList();
  }, [expoList, selectedFilter]);

  return withLoading({
    isLoading,
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
        {sortedExpoList.length > 0 ? (
          <div className="grid grid-cols-3 gap-x-36 gap-y-24 mobile:grid-cols-1">
            {sortedExpoList.map((item, index) => (
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
        ) : (
          <EmptyExpoList />
        )}
      </div>
    ),
  });
};

export default ExpoListContainer;
