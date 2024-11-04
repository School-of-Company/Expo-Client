'use client';

import React from 'react';
import { QRcode } from '@/entities/expo-detail';
import { Button, Modal, WhiteButton } from '@/shared/ui';
import { ModalLayout } from '@/widgets/layout';
import { useExpoActionPanel } from '../../model/useExpoActionPanel';

interface ExpoActionPanelProps {
  role?: 'user' | 'manage';
}

const ExpoActionPanel: React.FC<ExpoActionPanelProps> = ({
  role = 'manage',
}) => {
  const {
    isModalOpen,
    isQRModalOpen,
    modalContent,
    openModal,
    openQRModal,
    closeModal,
    closeQRModal,
  } = useExpoActionPanel();

  const getButtons = () => {
    if (role === 'user') {
      return (
        <Button
          onClick={() => openModal('해당 박람회에 지원하시겠습니까?')}
          text="신청하기"
        />
      );
    }
    if (role === 'manage') {
      return (
        <div className="w-full space-y-2 mobile:space-y-2">
          <div className="space-y-2 mobile:flex mobile:gap-5 mobile:space-y-0">
            <Button onClick={openQRModal} text="QR 조회하기" />
            <Button
              onClick={() => openModal('누구에게 문자를 전송하시겠습니까?')}
              text="문자 보내기"
            />
          </div>
          <WhiteButton text="수정하기" />
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <div className="h-fit max-w-[210px] space-y-[26px] rounded-sm border-1 border-solid border-gray-200 p-[18px] mobile:max-w-full mobile:border-none mobile:px-[16px]">
        <p className="text-caption1 text-black mobile:hidden">
          2024 AI광주미래교육박람회
        </p>
        <div className="space-y-2">{getButtons()}</div>
      </div>
      {isModalOpen && (
        <ModalLayout>
          <Modal text={modalContent} onClose={closeModal} />
        </ModalLayout>
      )}
      {isQRModalOpen && (
        <ModalLayout>
          <QRcode onClose={closeQRModal} qrData="https://www.instagram.com/" />
        </ModalLayout>
      )}
    </div>
  );
};

export default ExpoActionPanel;
