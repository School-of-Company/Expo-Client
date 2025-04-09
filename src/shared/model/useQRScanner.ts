import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { QrScanData } from '../types/common/QrScanData';

export const useQRScanner = (
  setScannedQR: React.Dispatch<React.SetStateAction<QrScanData | null>>,
) => {
  const [buffer, setBuffer] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);

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
      if (!isScanning) {
        setIsScanning(true);
        setBuffer('');
      }

      if (event.key === 'Enter') {
        const cleanData = buffer.replace(/Shift/g, '');

        if (!/^[a-zA-Z0-9{}":,._[\]\s-]+$/.test(cleanData)) {
          toast.warn('입력 언어를 영어로 변경해주세요.');
          setBuffer('');
          setIsScanning(false);
          return;
        }

        handleQRScan(cleanData);
        setBuffer('');
        setIsScanning(false);
      } else {
        setBuffer((prev) => prev + event.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [buffer, isScanning, handleQRScan]);
};
