'use client';

import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { QrScanData } from '../types/common/QrScanData';
import { parseQrScanValue } from './parseQrScanValue';
import { createScannerKeyHandler } from './scannerKeyHandler';

// 스캐너가 같은 QR을 연달아 읽으면 요청이 두 번 나가 두 번째가 '이미 입장'으로 실패한다.
// 같은 값이 이 시간 안에 다시 들어오면 무시한다
const DUPLICATE_SCAN_WINDOW_MS = 2_000;

/**
 * USB 스캐너(키보드 HID + Enter) 입력을 QR 값으로 바꾼다.
 * 돌려주는 submitScan 은 직접 입력한 값을 같은 규칙(중복 무시·형식 검사)으로 처리한다.
 * clearLastScan 은 요청이 실패했을 때 불러 같은 QR의 재스캔을 허용한다.
 * onInvalid 는 형식이 틀린 값을 화면에도 남기고 싶을 때 쓴다
 */
export const useQRScanner = (
  setScannedQR: React.Dispatch<React.SetStateAction<QrScanData | null>>,
  onInvalid?: (message: string) => void,
) => {
  const lastScanRef = useRef<{ value: string; at: number } | null>(null);

  const handleQRScan = useCallback(
    (cleanData: string) => {
      // 스캐너 입력과 직접 입력에 같은 형식 검사를 적용한다
      if (cleanData.length < 5) {
        const message = 'QR 코드 인식 실패: 데이터가 너무 짧습니다.';
        toast.warn(message);
        onInvalid?.(message);
        return;
      }
      if (!/^[a-zA-Z0-9{}":,._[\]\s-]+$/.test(cleanData)) {
        // 리더기 입력은 입력 언어와 상관없이 영문으로 모은다. 여기 오는 건 직접 입력한 한글 등이다
        const message =
          'QR 값에 읽을 수 없는 문자가 있습니다. 다시 찍거나 영문으로 입력해 주세요.';
        toast.warn(message);
        onInvalid?.(message);
        return;
      }

      const now = Date.now();
      const last = lastScanRef.current;
      if (
        last &&
        last.value === cleanData &&
        now - last.at < DUPLICATE_SCAN_WINDOW_MS
      ) {
        return;
      }
      lastScanRef.current = { value: cleanData, at: now };

      const { data, error } = parseQrScanValue(cleanData);
      if (!data) {
        toast.error(error);
        onInvalid?.(error);
        return;
      }
      setScannedQR(data);
    },
    [setScannedQR, onInvalid],
  );

  // 리렌더로 handleQRScan 이 바뀌어도 스캔 도중 모은 값이 사라지지 않게 처리기는 한 번만 만든다
  const handleQRScanRef = useRef(handleQRScan);
  useEffect(() => {
    handleQRScanRef.current = handleQRScan;
  }, [handleQRScan]);

  useEffect(() => {
    const { handleKeyDown, dispose } = createScannerKeyHandler((raw) =>
      handleQRScanRef.current(raw),
    );
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      dispose();
    };
  }, []);

  // 요청이 실패한 스캔은 중복 기준에서 빼서 바로 다시 찍을 수 있게 한다
  const clearLastScan = useCallback(() => {
    lastScanRef.current = null;
  }, []);

  return { submitScan: handleQRScan, clearLastScan };
};
