'use client';

import React from 'react';
import withLoading from '@/shared/hocs/withLoading';

import ExpoActionPanel from '@/widgets/expo-detail/ui/ExpoActionPanel';
import ExpoDetailLayout from '@/widgets/expo-detail/ui/ExpoDetailLayout';
import { Header } from '@/widgets/layout';
import { useExpoQueries } from '../../model/useExpoDetail';

const ExpoDetail = ({ params }: { params: number }) => {
  const { expoDetailQuery, expoStandardQuery, expoTrainingQuery, isLoading } =
    useExpoQueries(params);
  const expoDetail = expoDetailQuery.data!;
  const expoStandard = expoStandardQuery.data!;
  const expoTraining = expoTrainingQuery.data!;
  return withLoading({
    isLoading,
    children: (
      <div className="flex h-screen flex-col overflow-x-hidden mobile:gap-0">
        <Header />
        <div className="flex justify-center gap-[2.5rem] px-5 py-[30px] mobile:flex-col">
          <div className="w-full max-w-[842px]">
            <ExpoDetailLayout
              expoDetail={expoDetail}
              expoStandard={expoStandard}
              expoTraining={expoTraining}
            />
          </div>
          <ExpoActionPanel params={params} />
        </div>
      </div>
    ),
  });
};

export default ExpoDetail;
