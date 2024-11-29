'use client';
import { useRouter } from 'next/navigation';
import React from 'react';
import { XMark } from '@/shared/assets/icons';

interface Props {
  text: string;
  onClose: () => void;
  params: number;
  name: string;
}

const Modal = ({ text, onClose, params, name }: Props) => {
  const router = useRouter();

  const handleButtonClick = (type: string) => {
    if (name == 'application') {
      router.push(`/application/${params}/${type}`);
    }
  };

  return (
    <div className="w-[470px] rounded-sm bg-white px-7 py-8">
      <div className="flex flex-col gap-[90px]">
        <div className="flex w-full justify-between">
          <p>{text}</p>
          <label className="hover:cursor-pointer" onClick={onClose}>
            <XMark />
          </label>
        </div>
        <div className="flex gap-[50px]">
          <button
            className="w-full rounded-sm bg-main-500 py-3 text-white"
            onClick={() => handleButtonClick('standard')}
          >
            참가자
          </button>
          <button
            className="w-full rounded-sm bg-main-300 py-3 text-white"
            onClick={() => handleButtonClick('trainee')}
          >
            연수자
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
