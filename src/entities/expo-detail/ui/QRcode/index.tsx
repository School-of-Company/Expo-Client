import { QRCodeSVG } from 'qrcode.react';
import React from 'react';
import { XMark } from '@/shared/assets/icons';

interface Props {
  qrData: string;
  onClose: () => void;
}

const QR = ({ qrData, onClose }: Props) => {
  return (
    <div className="h-[306px] w-[330px] bg-white p-8">
      <div className="flex h-full flex-col items-center justify-between">
        <div className="flex w-full justify-between">
          <p className="text-h2">현장 신청 QR코드</p>
          <label onClick={onClose}>
            <XMark />
          </label>
        </div>
        <div className="p-5">
          <QRCodeSVG value={qrData} size={170} />
        </div>
      </div>
    </div>
  );
};

export default QR;
