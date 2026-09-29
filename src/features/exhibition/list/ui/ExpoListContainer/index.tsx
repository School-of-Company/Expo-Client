'use client';

import React, { useEffect, useState } from 'react';
import { EmptyExpoList, ExpoListItem, FormFilter } from '@/entities/exhibition';
import { withLoading } from '@/shared/hocs';
import { useExpoList } from '@/shared/queries';
import { useExpoPage } from '@/shared/queries';
import { ExpoItem, OptionType } from '@/shared/types/main/type';
import ExpoPageControls from '@/shared/ui/ExpoPageControls';
import { filterOptions } from '../../constant/filterOptions';
import { FormStatusData } from '../../model/FormStatusData';

const ExpoListContainer = () => {
  const [page, setPage] = useState(0);

  const [selectedFilter, setSelectedFilter] = useState<OptionType>({
    value: '필터',
    label: '필터',
    status: true,
  });

  const [sortedExpoList, setSortedExpoList] = useState<ExpoItem[] | null>(null);
  const filtered = selectedFilter.value !== '필터';
  const {
    data: expoPage,
    isLoading: pageLoading,
    error: pageError,
  } = useExpoPage(page, 20, !filtered);
  const {
    data: expoList,
    isLoading: filterLoading,
    error: filterError,
  } = useExpoList(filtered);

  useEffect(() => {
    setPage(0);
  }, [selectedFilter]);

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
    ? filterLoading || (expoList != null && sortedExpoList === null)
    : pageLoading;
  const displayed = filtered ? sortedExpoList : expoPage?.content;
  const error = filtered ? filterError : pageError;

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

        {error ? (
          <p role="alert">박람회 목록을 불러오지 못했습니다.</p>
        ) : displayed && displayed.length > 0 ? (
          <div className="grid grid-cols-3 gap-x-36 gap-y-24 mobile:grid-cols-1">
            {displayed.map((item) => (
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
          <ExpoPageControls
            page={page}
            totalPages={expoPage.totalPages}
            onPageChange={setPage}
          />
        )}
      </div>
    ),
  });
};

export default ExpoListContainer;
