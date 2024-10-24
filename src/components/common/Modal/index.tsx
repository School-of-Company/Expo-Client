import React from 'react';
import ModalButton from './atoms/ModalButton';
import { XMark } from '@/assets/icons';

const Modal = ({ text }: { text: string }) => {
  return (
    <div className="max-w-[470px] bg-white px-7 py-8">
      <div className="flex flex-col gap-[90px]">
        <div className="flex w-full justify-between">
          <p>{text}</p>
          <XMark />
        </div>
        <div className="flex gap-[50px]">
          <ModalButton text="참가자" bgColor="bg-main-500" />
          <ModalButton text="연수자" bgColor="bg-main-300" />
        </div>
      </div>
    </div>
  );
};

export default Modal;
