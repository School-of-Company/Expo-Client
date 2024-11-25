import React from 'react';
import { XMark } from '@/shared/assets/icons';
import { Button, Input } from '@/shared/ui';

interface ModalProps {
  setModal: (value: boolean) => void;
}

const Modal = ({ setModal }: ModalProps) => {
  return (
    <div className="absolute h-[192px] w-[312px] space-y-[24px] rounded-lg bg-white p-[18px] shadow-lg">
      <div className="flex justify-between">
        <p className="text-h4 text-black">연수 설정</p>
        <button onClick={() => setModal(false)}>
          <XMark />
        </button>
      </div>
      <div className="space-y-[28px]">
        <div className="flex w-full gap-2">
          <Input size="small" />
          <Input size="small" />
        </div>
        <Button type="button" text="확인" />
      </div>
    </div>
  );
};

export default Modal;
