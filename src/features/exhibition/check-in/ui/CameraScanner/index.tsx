'use client';

import { useEffect, useRef, useState } from 'react';
import type { IScannerControls } from '@zxing/browser';

// 카메라는 QR 이 보이는 동안 계속 같은 값을 읽는다. 화면에서 이 시간 이상 사라졌다가 다시 보일 때만 다시 넘긴다
const SAME_QR_ABSENCE_MS = 3_000;

// 카메라를 켜지 못한 이유별 안내
const toCameraErrorMessage = (error: unknown) => {
  const name =
    error && typeof error === 'object' && 'name' in error
      ? String((error as { name: unknown }).name)
      : '';
  if (name === 'NotAllowedError' || name === 'SecurityError') {
    return '카메라 권한이 없습니다. 브라우저 주소창의 카메라 권한을 허용한 뒤 다시 켜 주세요.';
  }
  if (name === 'NotFoundError' || name === 'OverconstrainedError') {
    return '사용할 수 있는 카메라를 찾지 못했습니다.';
  }
  if (name === 'NotReadableError') {
    return '다른 앱이 카메라를 쓰고 있어 켜지 못했습니다.';
  }
  return '카메라를 켜지 못했습니다. USB 스캐너나 직접 입력을 사용해 주세요.';
};

/**
 * 카메라로 QR 을 읽어 onScan 으로 넘긴다. 읽은 값은 스캐너 입력과 같은 규칙(2초 중복 무시·형식 검사)으로 처리된다.
 * 스캐너 라이브러리는 카메라를 켤 때만 불러온다
 */
const CameraScanner = ({ onScan }: { onScan: (value: string) => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const onScanRef = useRef(onScan);
  const lastSeenRef = useRef<{ text: string; at: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(true);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    let controls: IScannerControls | null = null;
    let isCancelled = false;

    const start = async () => {
      // 카메라는 HTTPS(또는 localhost)에서만 열린다
      if (!navigator.mediaDevices?.getUserMedia) {
        setError(
          '이 브라우저나 접속 주소(HTTPS 아님)에서는 카메라를 쓸 수 없습니다.',
        );
        setIsStarting(false);
        return;
      }
      try {
        const { BrowserQRCodeReader } = await import('@zxing/browser');
        if (isCancelled || !videoRef.current) return;
        const reader = new BrowserQRCodeReader();
        controls = await reader.decodeFromConstraints(
          // 휴대폰·태블릿은 후면 카메라를 우선 쓴다
          { video: { facingMode: { ideal: 'environment' } } },
          videoRef.current,
          (result) => {
            if (!result) return;
            const text = result.getText();
            const now = Date.now();
            const last = lastSeenRef.current;
            lastSeenRef.current = { text, at: now };
            // 같은 QR 을 계속 비추고 있는 동안에는 한 번만 처리한다
            if (last?.text === text && now - last.at < SAME_QR_ABSENCE_MS) {
              return;
            }
            onScanRef.current(text);
          },
        );
        if (isCancelled) controls.stop();
      } catch (e) {
        if (!isCancelled) setError(toCameraErrorMessage(e));
      } finally {
        if (!isCancelled) setIsStarting(false);
      }
    };

    start();
    return () => {
      isCancelled = true;
      controls?.stop();
    };
  }, []);

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-sm border-1 border-solid border-gray-200 bg-black">
        <video
          ref={videoRef}
          className="aspect-[4/3] w-full object-cover"
          muted
          playsInline
        />
        {isStarting && !error && (
          <p className="absolute inset-0 flex items-center justify-center text-body2r text-white">
            카메라를 켜는 중...
          </p>
        )}
      </div>
      {error && (
        <p role="alert" className="break-keep text-body2r text-error">
          {error}
        </p>
      )}
    </div>
  );
};

export default CameraScanner;
