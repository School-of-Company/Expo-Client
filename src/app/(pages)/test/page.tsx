'use client';

import { QRCodeSVG } from 'qrcode.react';
import React, { useState, useEffect } from 'react';

interface UserInfo {
  name: string;
  email: string;
  number: string;
}

const QRCodeScanner: React.FC = () => {
  const [scannedData, setScannedData] = useState<string>('');
  const [inputBuffer, setInputBuffer] = useState<string>('');
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        setScannedData(inputBuffer);
        handleScan(inputBuffer);
        setInputBuffer('');
      } else {
        setInputBuffer((prev) => prev + event.key);
      }
    };

    window.addEventListener('keypress', handleKeyPress);

    return () => {
      window.removeEventListener('keypress', handleKeyPress);
    };
  }, [inputBuffer]);

  const handleScan = async (data: string) => {
    setUserInfo(null);
    setError('');

    try {
      const response = await fetch('/api/QRcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scannedData: data }),
      });

      if (!response.ok) {
        throw new Error('QR 코드가 유효하지 않습니다.');
      }

      const user: UserInfo = await response.json();
      setUserInfo(user);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('알 수 없는 오류가 발생했습니다.');
      }
    }
  };

  const handlePrint = () => {
    const printContents = document.getElementById('printArea')?.innerHTML;
    if (printContents) {
      const printWindow = window.open('', '_blank');
      printWindow?.document.write(`
        <html>
          <head>
            <title>Print QR Code</title>
            <style>
              @media print {
                @page { margin: 0; } 
                body { margin: 0; font-family: Arial, sans-serif; text-align: center; padding: 20px; }
                .w-[500px] { width: 500px; margin: 0 auto; }
                .border-[3px] { border-width: 3px; }
                .border-solid { border-style: solid; }
                .border-gray-400 { border-color: gray; }
                .p-16 { padding: 16px; }
              }
            </style>
          </head>
          <body onload="window.print(); window.close();">
            ${printContents}
          </body>
        </html>
      `);
      printWindow?.document.close();
    }
  };

  return (
    <div>
      <h2>스캔된 QR 코드 데이터:</h2>
      <p>{scannedData}</p>
      <div id="printArea">
        {userInfo && (
          <div className="w-[500px] border-[3px] border-solid border-gray-400 p-16 text-center">
            <p>사용자이름: {userInfo.name}</p>
            <p>번호: {userInfo.number}</p>
            <p>이메일: {userInfo.email}</p>
            <div className="flex justify-center">
              <QRCodeSVG value={scannedData} size={50} />
            </div>
          </div>
        )}
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {userInfo && (
        <button
          className="mt-4 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
          onClick={handlePrint}
        >
          프린트
        </button>
      )}
    </div>
  );
};

export default QRCodeScanner;
