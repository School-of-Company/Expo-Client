import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { QrScanData } from '../types/common/QrScanData';

export const useQRScanner = (
  setScannedQR: React.Dispatch<React.SetStateAction<QrScanData | null>>,
) => {
  const bufferRef = useRef<string>('');
  const isScanningRef = useRef<boolean>(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleQRScan = useCallback(
    (cleanData: string) => {
      try {
        const parsedData: QrScanData = JSON.parse(cleanData);
        setScannedQR(parsedData);
      } catch (error) {
        toast.error('QR 코드 데이터 파싱 오류');
      }
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
