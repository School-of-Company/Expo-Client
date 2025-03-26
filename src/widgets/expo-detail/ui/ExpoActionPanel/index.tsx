'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { Share } from '@/shared/assets/svg';
import { Button, FormTypeModal } from '@/shared/ui';
import { ModalLayout } from '@/widgets/layout';
import { useExpoActionPanel } from '../../model/useExpoActionPanel';

interface ExpoActionPanelProps {
  params: number;
}

const ExpoActionPanel = ({ params }: ExpoActionPanelProps) => {
  const router = useRouter();
  const { isModalOpen, modalContent, openModal, closeModal } =
    useExpoActionPanel();
  const [modalType, setModalType] = useState<string | null>(null);

  const handleOpenModal = (type: string, content: string) => {
    setModalType(type);
    openModal(content);
  };

  return (
    <div>
      <div className="flex flex-col items-center gap-24">
        <div className="h-fit w-[210px] space-y-[26px] rounded-sm border-1 border-solid border-gray-200 p-[18px] mobile:w-full mobile:border-none mobile:px-[16px]">
          <div className="space-y-2">
            <div className="w-full space-y-2 mobile:space-y-2">
              <div className="space-y-2 mobile:flex mobile:gap-5 mobile:space-y-0">
                <Button onClick={() => router.push(`/name-tag/${params}`)}>
                  QR 조회하기
                </Button>
                <Button
                  onClick={() =>
                    handleOpenModal('message', '대상을 선택하세요.')
                  }
                >
                  문자 보내기
                </Button>
              </div>
              <Button
                onClick={() =>
                  router.push(`/program/${params}?navigation=standard`)
                }
                variant="main100"
              >
                프로그램
              </Button>
              <Button
                onClick={() => router.push(`/expo-manage/${params}`)}
                variant="main100"
              >
                조회하기
              </Button>
              <Button
                onClick={() =>
                  handleOpenModal('edit', '수정할 항목을 선택하세요.')
                }
                variant="white"
              >
                수정하기
              </Button>
            </div>
          </div>
        </div>
        <button
          type="button"
          className="flex items-center gap-10"
          onClick={() => handleOpenModal('share', '공유할 항목을 선택하세요.')}
        >
          <Share />
          <p className="text-h3r text-gray-400">공유하기</p>
        </button>
      </div>
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

export default ExpoActionPanel;
