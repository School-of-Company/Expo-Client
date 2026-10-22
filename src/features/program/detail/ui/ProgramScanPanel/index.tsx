'use client';

import { useState } from 'react';
import { CameraScanner, ManualScanInput } from '@/features/exhibition/check-in';

/** 카메라 스캔과 QR 값 직접 입력. 리더기로 읽은 값은 화면이 따로 받는다 */
const ProgramScanPanel = ({ onScan }: { onScan: (value: string) => void }) => {
  const [isCameraOn, setIsCameraOn] = useState(false);

  return (
    <div className="flex flex-col gap-20 rounded-sm border-1 border-solid border-gray-200 p-24 mobile:p-16">
      <div className="flex items-center justify-between gap-12">
        <p className="text-body1b text-black">QR 스캔</p>
        <button
          type="button"
          onClick={() => setIsCameraOn((prev) => !prev)}
          aria-pressed={isCameraOn}
          className={`rounded-sm border-1 border-solid px-16 py-8 text-caption1b ${
            isCameraOn
              ? 'border-main-600 bg-main-600 text-white'
              : 'border-main-600 text-main-600'
          }`}
        >
          {isCameraOn ? '카메라 끄기' : '카메라로 스캔'}
        </button>
      </div>
      {isCameraOn && <CameraScanner onScan={onScan} />}
      <div className="space-y-8">
        <p className="text-caption1r text-gray-600">QR 값 직접 입력</p>
        <ManualScanInput onSubmit={onScan} />
      </div>
      <p className="break-keep text-caption1r text-gray-500">
        리더기를 쓸 때는 입력 언어를 영어로 바꿔 주세요. 한글 입력기 상태에서는
        값이 깨져 스캔이 실패합니다.
      </p>
    </div>
  );
};

export default ProgramScanPanel;
