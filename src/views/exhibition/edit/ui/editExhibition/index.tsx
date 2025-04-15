'use client';

import React from 'react';
import withLoading from '@/shared/hocs/withLoading';
import { formatDateTime } from '@/widgets/exhibition/edit/model/formatDateTime';
import { useEditExhibitionMutation } from '@/widgets/exhibition/edit/model/useEditExhibitionMutation';
import ExhibitionForm from '@/widgets/exhibition/ui/ExhibitionForm';
import { Header } from '@/widgets/layout';
import { useExpoData } from '../../model/useExpoData';

const EditExhibition = ({ id }: { id: string }) => {
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

  const defaultValues = {
    title: expoDetail?.title ?? '',
    introduction: expoDetail?.description ?? '',
    startedDay: expoDetail?.startedDay ?? '',
    finishedDay: expoDetail?.finishedDay ?? '',
    image: expoDetail?.coverImage ?? '',
    address: geoQueryData?.documents?.[0]?.road_address?.address_name ?? '',
    location: expoDetail?.location ?? '',
    trainings: [
      ...(expoTraining?.essential ?? []),
      ...(expoTraining?.choice ?? []),
    ].map((training) => ({
      id: training.id,
      title: training.title,
      startedAt: formatDateTime(training.startedAt),
      endedAt: formatDateTime(training.endedAt),
      category: training.category,
    })),
    standard: (expoStandard ?? []).map((std) => ({
      id: std.id,
      title: std.title,
      startedAt: formatDateTime(std.startedAt),
      endedAt: formatDateTime(std.endedAt),
    })),
  };

  const { mutate, isPending, isSuccess } = useEditExhibitionMutation(id);

  return (
    <div className="flex min-h-screen flex-col gap-[30px]">
      <Header />
      {withLoading({
        isLoading,
        children: (
          <div className="flex flex-1 justify-center overflow-hidden p-16">
            <ExhibitionForm
              defaultValues={defaultValues}
              mutation={{ mutate, isPending, isSuccess }}
            />
          </div>
        ),
      })}
    </div>
  );
};

export default EditExhibition;
