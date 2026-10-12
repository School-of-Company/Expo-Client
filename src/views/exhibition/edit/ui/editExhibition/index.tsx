'use client';

import { useState } from 'react';
import { ExhibitionForm } from '@/features/exhibition/common';
import {
  formatDateTime,
  hasPendingProgramChange,
  ProgramChangeRetryNotice,
  useEditExhibitionMutation,
  useExpoData,
} from '@/features/exhibition/edit';
import { withLoading } from '@/shared/hocs';
import { Header } from '@/widgets/layout';

const EditExhibition = ({ id }: { id: string }) => {
  const {
    expoDetailQuery,
    geoQuery,
    expoStandardQuery,
    expoTrainingQuery,
    isLoading,
  } = useExpoData(id);
  // 변경 재시도 뒤 최신 revision으로 폼을 다시 채우기 위해 key를 바꾼다
  const [formKey, setFormKey] = useState(0);

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
      revision: training.revision,
      title: training.title,
      startedAt: formatDateTime(training.startedAt),
      endedAt: formatDateTime(training.endedAt),
      category: training.category,
    })),
    standard: (expoStandard ?? []).map((std) => ({
      id: std.id,
      revision: std.revision,
      title: std.title,
      startedAt: formatDateTime(std.startedAt),
      endedAt: formatDateTime(std.endedAt),
    })),
  };

  const { mutate, isPending, isSuccess } = useEditExhibitionMutation(id);

  const hasPendingChange = hasPendingProgramChange([
    ...(expoStandard ?? []),
    ...expoTrainingData,
  ]);

  return (
    <div className="flex min-h-screen flex-col gap-[30px]">
      <Header />
      {withLoading({
        isLoading,
        children: (
          <div className="flex flex-1 flex-col items-center gap-16 overflow-hidden p-16">
            {hasPendingChange && (
              <div className="w-full max-w-[816px]">
                <ProgramChangeRetryNotice
                  id={id}
                  onRetried={() => setFormKey((key) => key + 1)}
                />
              </div>
            )}
            <ExhibitionForm
              key={formKey}
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
