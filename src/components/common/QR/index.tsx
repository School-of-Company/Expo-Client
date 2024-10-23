import { QRCodeSVG } from 'qrcode.react';
import React from 'react';
import { XMark } from '@/assets/icons';

const QR = ({ qrData }: { qrData: string }) => {
  return (
    <div className="bg-white p-8">
      <div className="flex flex-col items-center gap-6">
        <div className="flex w-full justify-between">
          <p className="text-h2">현장 신청 QR코드</p>
          <XMark />
        </div>
        <QRCodeSVG value={qrData} />
      </div>
    </div>
  );
};

export default QR;
