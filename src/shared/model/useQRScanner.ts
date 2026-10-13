'use client';

import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { QrScanData } from '../types/common/QrScanData';
import { parseQrScanValue } from './parseQrScanValue';

// 스캐너가 같은 QR을 연달아 읽으면 요청이 두 번 나가 두 번째가 '이미 입장'으로 실패한다.
// 같은 값이 이 시간 안에 다시 들어오면 무시한다
const DUPLICATE_SCAN_WINDOW_MS = 2_000;

export const useQRScanner = (
  setScannedQR: React.Dispatch<React.SetStateAction<QrScanData | null>>,
) => {
  const bufferRef = useRef<string>('');
  const isScanningRef = useRef<boolean>(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastScanRef = useRef<{ value: string; at: number } | null>(null);

  const handleQRScan = useCallback(
    (cleanData: string) => {
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
        return;
      }
      setScannedQR(data);
    },
    [setScannedQR],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.length !== 1 && event.key !== 'Enter') return;

      if (!isScanningRef.current) {
        isScanningRef.current = true;
        bufferRef.current = '';
      }

      if (event.key === 'Enter') {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        const cleanData = bufferRef.current;

        if (cleanData.length < 5) {
          toast.warn('QR 코드 인식 실패: 데이터가 너무 짧습니다.');
        } else if (!/^[a-zA-Z0-9{}":,._[\]\s-]+$/.test(cleanData)) {
          toast.warn('입력 언어를 영어로 변경해주세요.');
        } else {
          handleQRScan(cleanData);
        }

        bufferRef.current = '';
        isScanningRef.current = false;
        return;
      }

      bufferRef.current += event.key;

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        bufferRef.current = '';
        isScanningRef.current = false;
      }, 300);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [handleQRScan]);
};
