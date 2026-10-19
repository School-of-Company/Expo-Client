'use client';

import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { QrScanData } from '../types/common/QrScanData';
import { parseQrScanValue } from './parseQrScanValue';

// 스캐너가 같은 QR을 연달아 읽으면 요청이 두 번 나가 두 번째가 '이미 입장'으로 실패한다.
// 같은 값이 이 시간 안에 다시 들어오면 무시한다
const DUPLICATE_SCAN_WINDOW_MS = 2_000;

// 입력창에 타이핑하는 키는 스캐너 입력으로 모으지 않는다(직접 입력은 그 입력창이 처리한다)
const isEditableTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

/**
 * USB 스캐너(키보드 HID + Enter) 입력을 QR 값으로 바꾼다.
 * 돌려주는 submitScan 은 직접 입력한 값을 같은 규칙(중복 무시·형식 검사)으로 처리한다.
 * onInvalid 는 형식이 틀린 값을 화면에도 남기고 싶을 때 쓴다
 */
export const useQRScanner = (
  setScannedQR: React.Dispatch<React.SetStateAction<QrScanData | null>>,
  onInvalid?: (message: string) => void,
) => {
  const bufferRef = useRef<string>('');
  const isScanningRef = useRef<boolean>(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
        const message = '입력 언어를 영어로 변경해주세요.';
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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.length !== 1 && event.key !== 'Enter') return;
      if (isEditableTarget(event.target)) return;

      // 문자 없이 Enter만 온 것은 스캔이 아니다. 포커스된 버튼의 Enter 동작을 그대로 둔다
      if (event.key === 'Enter' && bufferRef.current === '') return;

      const wasScanning = isScanningRef.current;
      if (!wasScanning) {
        isScanningRef.current = true;
        bufferRef.current = '';
      }

      if (event.key === 'Enter') {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        // 스캔을 끝내는 Enter가 포커스된 버튼까지 누르지 않게 한다
        event.preventDefault();
        handleQRScan(bufferRef.current);

        bufferRef.current = '';
        isScanningRef.current = false;
        return;
      }

      // 스캔 도중 들어온 문자(특히 공백)가 포커스된 버튼을 누르지 않게 한다.
      // 첫 글자는 일반 타이핑과 구분할 수 없어 그대로 둔다
      if (wasScanning && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
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

  return { submitScan: handleQRScan };
};
