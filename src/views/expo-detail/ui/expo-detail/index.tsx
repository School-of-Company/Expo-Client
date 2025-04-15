'use client';

import React, { useState } from 'react';
import withLoading from '@/shared/hocs/withLoading';
import { FormTypeModal } from '@/shared/ui';
import ExpoActionPanel from '@/widgets/expo-detail/ui/ExpoActionPanel';
import ExpoDetailLayout from '@/widgets/expo-detail/ui/ExpoDetailLayout';
import { Header } from '@/widgets/layout';
import { ModalLayout } from '@/widgets/layout';
import { useExpoQueries } from '../../model/useExpoDetail';

const ExpoDetail = ({ params }: { params: string }) => {
  const { expoDetailQuery, expoStandardQuery, expoTrainingQuery, isLoading } =
    useExpoQueries(params);
  const expoDetail = expoDetailQuery.data!;
  const expoStandard = expoStandardQuery.data!;
  const expoTraining = expoTrainingQuery.data!;

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
          <div className="flex flex-1 justify-center p-16">
            <div className="flex w-full max-w-[1000px] flex-1 gap-40 tablet:w-full tablet:max-w-none tablet:flex-col">
              <div className="w-full max-w-[750px] tablet:w-full tablet:max-w-none">
                <ExpoDetailLayout
                  expoDetail={expoDetail}
                  expoStandard={expoStandard}
                  expoTraining={expoTraining}
                  openModal={openModal}
                />
              </div>
              <div className="w-full max-w-[210px] tablet:w-full tablet:max-w-none">
                <ExpoActionPanel params={params} openModal={openModal} />
              </div>
            </div>
          </div>
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

export default ExpoDetail;
