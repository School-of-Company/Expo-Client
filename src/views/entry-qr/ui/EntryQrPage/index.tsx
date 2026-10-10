'use client';

import { QRCodeCanvas } from 'qrcode.react';
import { useRef } from 'react';
import { downloadQrImage } from '@/shared/libs/downloadQrImage';
import {
  EntryQrQuery,
  maskPhoneNumber,
  parseEntryQrQuery,
} from '../../lib/parseEntryQrQuery';

const EntryQrPage = ({ query }: { query: EntryQrQuery }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const entryQr = parseEntryQrQuery(query);

  if (!entryQr) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-12 p-16 text-center">
        <p className="text-h3b text-black">QR을 표시할 수 없습니다</p>
        <p className="text-body2r text-gray-500">
          링크가 올바르지 않습니다. 문자로 받은 링크를 다시 열어 주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-24 p-16">
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-h3b text-black">입장 QR</p>
        <p className="text-body2r text-gray-500">
          현장 입장 시 이 QR을 보여주세요
        </p>
      </div>

      <div className="w-full max-w-[420px] rounded-sm border-1 border-solid border-gray-200 bg-white p-16">
        <QRCodeCanvas
          ref={canvasRef}
          value={entryQr.value}
          size={512}
          marginSize={2}
          className="!h-auto !w-full"
        />
      </div>

      <div className="flex flex-col items-center gap-4">
        <p className="text-body1b text-black">{entryQr.typeLabel}</p>
        {entryQr.phoneNumber && (
          <p className="text-body2r text-gray-500">
            {maskPhoneNumber(entryQr.phoneNumber)}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => downloadQrImage(canvasRef.current!, entryQr.typeLabel)}
        className="w-full max-w-[420px] rounded-sm bg-main-600 py-12 text-body2b text-white"
      >
        QR 이미지 저장
      </button>
    </div>
  );
};

export default EntryQrPage;
