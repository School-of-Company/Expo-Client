import { useCallback, useEffect, useState } from 'react';
import { TraineeData } from '../types/name-tag/type';

export const useQRScanner = (
  setScannedQR: React.Dispatch<React.SetStateAction<TraineeData | null>>,
) => {
  const [buffer, setBuffer] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);

  const handleQRScan = useCallback(
    (cleanData: string) => {
      try {
        const parsedData: TraineeData = JSON.parse(cleanData);
        setScannedQR(parsedData);
      } catch (error) {
        console.error('QR 코드 데이터 파싱 오류:', error);
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
