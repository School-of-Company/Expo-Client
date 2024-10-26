import React from 'react';
import { XMark } from '@/shared/assets/icons';

const Modal = ({ text }: { text: string }) => {
  return (
    <div className="max-w-[470px] bg-white px-7 py-8">
      <div className="flex flex-col gap-[90px]">
        <div className="flex w-full justify-between">
          <p>{text}</p>
          <XMark />
        </div>
        <div className="flex gap-[50px]">
          <button className="w-full rounded-sm bg-main-500 py-3 text-white">
            참가자
          </button>
          <button className="w-full rounded-sm bg-main-300 py-3 text-white">
            연수자
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
