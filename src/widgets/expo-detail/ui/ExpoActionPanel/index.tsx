'use client';

import { useRouter } from 'next/navigation';
import React from 'react';
import { useRole } from '@/shared/model/useRole';
import { Button, Modal } from '@/shared/ui';
import { ModalLayout } from '@/widgets/layout';
import { useExpoActionPanel } from '../../model/useExpoActionPanel';

interface ExpoActionPanelProps {
  params: number;
}

const ExpoActionPanel = ({ params }: ExpoActionPanelProps) => {
  const role = useRole();
  const router = useRouter();
  const { isModalOpen, modalContent, openModal, closeModal } =
    useExpoActionPanel();

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
            <Button
              onClick={() => {
                router.push(`/name-tag/${params}`);
              }}
              text="QR 조회하기"
            />
            <Button
              onClick={() => openModal('누구에게 문자를 전송하시겠습니까?')}
              text="문자 보내기"
            />
          </div>
          <Button
            onClick={() => {
              router.push(`/program/${params}?navigation=standard`);
            }}
            text="프로그램"
            style="main100"
          />

          <Button
            onClick={() => {
              router.push(`/expo-manage/${params}`);
            }}
            text="조회하기"
            style="main100"
          />
          <Button text="수정하기" style="white" />
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <div className="h-fit w-[210px] space-y-[26px] rounded-sm border-1 border-solid border-gray-200 p-[18px] mobile:w-full mobile:border-none mobile:px-[16px]">
        <div className="space-y-2">{getButtons()}</div>
      </div>
      {isModalOpen && (
        <ModalLayout>
          {role === 'user' && (
            <Modal
              text={modalContent}
              onClose={closeModal}
              params={params}
              name={'application'}
            />
          )}
          {role == 'manage' && (
            <Modal
              text={modalContent}
              onClose={closeModal}
              params={params}
              name={'message'}
            />
          )}
        </ModalLayout>
      )}
    </div>
  );
};

export default ExpoActionPanel;
