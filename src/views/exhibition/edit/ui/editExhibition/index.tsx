'use client';

import React from 'react';
import withLoading from '@/shared/hocs/withLoading';
import EditExhibitionForm from '@/widgets/exhibition/edit/ui/EditExhibitionForm';
import { Header } from '@/widgets/layout';
import { useExpoData } from '../../model/useExpoData';

const EditExhibition = ({ id }: { id: number }) => {
  const {
    expoDetailQuery,
    geoQuery,
    expoStandardQuery,
    expoTrainingQuery,
    isLoading,
  } = useExpoData(id);

  const expoDetail = expoDetailQuery.data!;
  const geoQueryData = geoQuery.data!;
  const expoStandard = expoStandardQuery.data!;
  const expoTraining = expoTrainingQuery.data!;
  return withLoading({
    isLoading,
    children: (
      <div className="flex h-screen flex-col gap-[30px] mobile:gap-0">
        <Header />
        <div className="mx-auto w-full max-w-[792px] flex-1 px-5 pb-5">
          <EditExhibitionForm
            expoDetail={expoDetail}
            geoQueryData={geoQueryData}
            expoStandard={expoStandard}
            expoTraining={expoTraining}
            id={id}
          />
        </div>
      </div>
    ),
  });
};

export default EditExhibition;
