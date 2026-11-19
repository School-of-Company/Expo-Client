'use client';

import React, { useState } from 'react';
import {
  SHARE_MODAL_TITLE,
  ShareFormModal,
  useExpoQueries,
} from '@/features/exhibition/detail';
import { withLoading } from '@/shared/hocs';
import { EXPO_FORBIDDEN_MESSAGE } from '@/shared/libs/http/apiError';
import { QueryError } from '@/shared/ui';
import { ExhibitionDetailContent } from '@/widgets/exhibition/detail';
import { Header } from '@/widgets/layout';
import { ModalLayout } from '@/widgets/layout';

const ExhibitionDetailPage = ({ params }: { params: string }) => {
  const {
    expoDetailQuery,
    expoStandardQuery,
    expoTrainingQuery,
    isLoading,
    isError,
    isForbidden,
    refetchFailed,
  } = useExpoQueries(params);
  const expoDetail = expoDetailQuery.data;
  const expoStandard = expoStandardQuery.data ?? [];

  const expoTrainingData = expoTrainingQuery.data || [];
  const expoTraining = {
    essential: expoTrainingData.filter((item) => item.category === 'ESSENTIAL'),
    choice: expoTrainingData.filter((item) => item.category === 'CHOICE'),
  };

  // 폼 만들기·수정은 페이지로 옮겼고, 이 화면의 모달은 신청 주소 공유만 한다
  const [isShareOpen, setIsShareOpen] = useState(false);
  const closeShare = () => setIsShareOpen(false);

  return (
    <div className="flex min-h-screen flex-col gap-30">
      <Header />
      {withLoading({
        isLoading,
        children: isForbidden ? (
          <p
            role="alert"
            className="flex w-full flex-1 items-center justify-center break-keep p-16 text-center text-body2r text-gray-500"
          >
            {EXPO_FORBIDDEN_MESSAGE}
          </p>
        ) : isError || !expoDetail ? (
          <QueryError
            message="박람회 정보를 불러오지 못했습니다."
            onRetry={refetchFailed}
          />
        ) : (
          <ExhibitionDetailContent
            expoDetail={expoDetail}
            expoStandard={expoStandard}
            expoTraining={expoTraining}
            params={params}
            onShare={() => setIsShareOpen(true)}
          />
        ),
      })}
      {isShareOpen && (
        <ModalLayout label={SHARE_MODAL_TITLE} onClose={closeShare}>
          <ShareFormModal expoId={params} onClose={closeShare} />
        </ModalLayout>
      )}
    </div>
  );
};

export default ExhibitionDetailPage;
