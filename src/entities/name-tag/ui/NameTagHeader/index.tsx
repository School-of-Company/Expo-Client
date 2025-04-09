import React from 'react';
import { Button, QrModal } from '@/shared/ui';
import { useExpoActionPanel } from '@/widgets/expo-detail/model/useExpoActionPanel';
import { ModalLayout } from '@/widgets/layout';
interface NameTagHeaderProps {
  params: string;
}

const NameTagHeader = ({ params }: NameTagHeaderProps) => {
  const { isModalOpen, modalContent, openModal, closeModal } =
    useExpoActionPanel();

  return (
    <div className="flex items-center justify-between">
      <p className="text-h2b text-black">참가자 명찰 인원</p>
      <div className="w-[213px]">
        <Button onClick={() => openModal('현장 신청 QR 코드')}>
          현장 QR 조회하기
        </Button>
      </div>
      {isModalOpen && (
        <ModalLayout>
          <QrModal text={modalContent} onClose={closeModal} params={params} />
        </ModalLayout>
      )}
    </div>
  );
};

export default NameTagHeader;
