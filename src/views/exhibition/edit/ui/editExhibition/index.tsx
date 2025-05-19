'use client';

import { ExhibitionForm } from '@/features/exhibition/common';
import {
  formatDateTime,
  useEditExhibitionMutation,
  useExpoData,
} from '@/features/exhibition/edit';
import withLoading from '@/shared/hocs/withLoading';
import { Header } from '@/widgets/layout';

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

  const expoTrainingData = expoTrainingQuery.data || [];
  const expoTraining = {
    essential: expoTrainingData.filter((item) => item.category === 'ESSENTIAL'),
    choice: expoTrainingData.filter((item) => item.category === 'CHOICE'),
  };

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
