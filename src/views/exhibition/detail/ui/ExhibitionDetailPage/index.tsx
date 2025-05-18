'use client';

import React, { useState } from 'react';
import { useExpoQueries } from '@/features/exhibition/detail';
import withLoading from '@/shared/hocs/withLoading';
import { FormTypeModal } from '@/shared/ui';
import ExhibitionDetailContent from '@/widgets/exhibition/detail/ui/ExhibitionDetailContent';
import { Header } from '@/widgets/layout';
import { ModalLayout } from '@/widgets/layout';

const ExhibitionDetailPage = ({ params }: { params: string }) => {
  const { expoDetailQuery, expoStandardQuery, expoTrainingQuery, isLoading } =
    useExpoQueries(params);
  const expoDetail = expoDetailQuery.data!;
  const expoStandard = expoStandardQuery.data!;

  const expoTrainingData = expoTrainingQuery.data || [];
  const expoTraining = {
    essential: expoTrainingData.filter((item) => item.category === 'ESSENTIAL'),
    choice: expoTrainingData.filter((item) => item.category === 'CHOICE'),
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [modalType, setModalType] = useState<string | null>(null);

  const openModal = (type: string, content: string) => {
    setModalType(type);
    setModalContent(content);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent('');
    setModalType(null);
  };

  return (
    <div className="flex min-h-screen flex-col gap-30">
      <Header />
      {withLoading({
        isLoading,
        children: (
          <ExhibitionDetailContent
            expoDetail={expoDetail}
            expoStandard={expoStandard}
            expoTraining={expoTraining}
            params={params}
            openModal={openModal}
          />
        ),
      })}
      {isModalOpen && (
        <ModalLayout>
          <FormTypeModal
            text={modalContent}
            onClose={closeModal}
            params={params}
            modalType={modalType}
          />
        </ModalLayout>
      )}
    </div>
  );
};

export default ExhibitionDetailPage;
