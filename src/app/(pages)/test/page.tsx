'use client';

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
    const printWindow = window.open('', '_blank');
    if (printWindow && userInfo) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>사용자 정보 출력</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                box-sizing: border-box;
              }
              .print-container {
                border: 3px solid #ccc;
                padding: 20px;
                max-width: 500px;
                margin: 0 auto;
              }
              @media print {
                body { margin: 0; }
                @page { margin: 0; }
              }
            </style>
          </head>
          <body>
            <div class="print-container">
              <h2>사용자 정보</h2>
              <p><strong>이름:</strong> ${userInfo.name}</p>
              <p><strong>번호:</strong> ${userInfo.number}</p>
              <p><strong>이메일:</strong> ${userInfo.email}</p>
            </div>
            <script>
              window.onload = function() {
                window.print();
                window.onafterprint = function() {
                  window.close();
                }
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div>
      <h2>스캔된 QR 코드 데이터:</h2>
      <p>{scannedData}</p>
      <div id="printArea">
        {userInfo && (
          <div className="w-[500px] border-[3px] border-solid border-gray-400 p-16">
            <p>사용자이름: {userInfo.name}</p>
            <p>번호: {userInfo.number}</p>
            <p>이메일: {userInfo.email}</p>
          </div>
        )}
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {userInfo && (
        <button
          onClick={handlePrint}
          className="mt-4 rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
        >
          프린트
        </button>
      )}
    </div>
  );
};

export default QRCodeScanner;
