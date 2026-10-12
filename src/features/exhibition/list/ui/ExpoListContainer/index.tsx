'use client';

import React from 'react';
import { CreateExpoCard, ExpoListItem } from '@/entities/exhibition';
import { withLoading } from '@/shared/hocs';
import { useExpoPage } from '@/shared/queries';
import { NavigationBar } from '@/shared/ui';

const ExpoListContainer = () => {
  const { data: expoPage, isLoading, isError, refetch } = useExpoPage();
  const expoList = expoPage?.content;

  return withLoading({
    isLoading,
    children: (
      <div className="flex w-full max-w-[1200px] flex-1 flex-col overflow-auto">
        <div className="mb-[30px] flex justify-between">
          <p className="text-h1m text-black">박람회</p>
        </div>

        {/* 실패를 빈 목록처럼 보이지 않게 따로 알린다. 생성 카드는 그대로 둔다 */}
        {isError && (
          <div className="mb-24 flex items-center justify-between gap-16 rounded-sm border-1 border-solid border-gray-200 px-20 py-16">
            <p className="text-body2r text-gray-500">
              박람회 목록을 불러오지 못했습니다.
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="shrink-0 text-body2r text-main-600 underline"
            >
              다시 시도
            </button>
          </div>
        )}
        <div className="grid grid-cols-3 gap-x-36 gap-y-24 mobile:grid-cols-1">
          {expoList?.map((item) => (
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
          <CreateExpoCard />
        </div>
        {expoPage && (
          <div className="mt-[30px] flex justify-center">
            <NavigationBar totalPage={expoPage.totalPages} />
          </div>
        )}
      </div>
    ),
  });
};

export default ExpoListContainer;
