'use client';

import React from 'react';
import { EmptyExpoList, ExpoListItem } from '@/entities/exhibition';
import { withLoading } from '@/shared/hocs';
import { useExpoPage } from '@/shared/queries';
import { NavigationBar } from '@/shared/ui';

const ExpoListContainer = () => {
  const { data: expoPage, isLoading } = useExpoPage();
  const expoList = expoPage?.content;

  return withLoading({
    isLoading,
    children: (
      <div className="flex w-full max-w-[1200px] flex-1 flex-col overflow-auto">
        <div className="mb-[30px] flex justify-between">
          <p className="text-h1m text-black">박람회 조회</p>
        </div>

        {expoList && expoList.length > 0 ? (
          <div className="grid grid-cols-3 gap-x-36 gap-y-24 mobile:grid-cols-1">
            {expoList.map((item) => (
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
