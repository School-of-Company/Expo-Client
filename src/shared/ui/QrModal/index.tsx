'use client';
import React from 'react';
import QRCode from 'react-qr-code';
import { XMark } from '@/shared/assets/icons';

interface Props {
  text: string;
  onClose: () => void;
  params: string;
}

const QrModal = ({ text, onClose, params }: Props) => {
  return (
    <div className="w-[250px] rounded-sm bg-white px-7 pt-8">
      <div>
        <div className="flex w-full justify-between">
          <p>{text}</p>
          <label className="hover:cursor-pointer" onClick={onClose}>
            <XMark />
          </label>
        </div>
        <div className="flex">
          <QRCode
            value={`http://localhost:3000/application/${params}/STANDARD`}
            size={256}
          />
        </div>
      </div>
    </div>
  );
};

export default QrModal;
