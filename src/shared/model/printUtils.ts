'use client';

import { QRCodeSVG } from 'qrcode.react';
import { createElement } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

const renderQRCodeSVG = (value: string): string => {
  const host = document.createElement('div');
  const root = createRoot(host);

  flushSync(() => {
    root.render(createElement(QRCodeSVG, { value, size: 130 }));
  });

  const markup = host.innerHTML;
  root.unmount();

  return markup;
};

export const printBadge = (selectedData: {
  name: string;
  qrCode: string;
  isTemporary: boolean;
}) => {
  const printWindow = window.open('', '_blank');

  if (!printWindow) return;

  const isBase64 =
    selectedData.qrCode &&
    (selectedData.qrCode.startsWith('/9j/') ||
      selectedData.qrCode.includes('base64'));

  printWindow.document.write(`
      <html>
        <head>
          <title>Badge</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
            }
            .badge {
              text-align: center;
              padding: 20px;
              width: 100%;
            }
            .badge h1 {
              font-size: 24px;
              margin-bottom: 10px;
              font-weight: bold;
            }
            .badge p {
              margin: 5px 0;
              font-size: 16px;
              color: #555;
            }
            .qr-container {
              margin-top: 20px;
              display: flex;
              justify-content: center;
            }
            @media print {
              @page {
                margin: 0;
              }
              body {
                margin: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="badge">
            <h1 id="badge-name"></h1>
            ${selectedData.isTemporary ? `<p style="font-size:14px;">(임시 QR)</p>` : ''}
            <div class="qr-container" id="badge-qr"></div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);

  const doc = printWindow.document;

  // 외부 입력값이므로 HTML 파싱 없이 textContent / 프로퍼티로만 주입한다.
  const nameElement = doc.getElementById('badge-name');
  if (nameElement) nameElement.textContent = selectedData.name;

  const qrContainer = doc.getElementById('badge-qr');
  if (qrContainer) {
    if (isBase64) {
      const image = doc.createElement('img');
      image.src = `data:image/png;base64,${selectedData.qrCode}`;
      image.alt = 'QR Code';
      image.width = 100;
      image.height = 100;
      qrContainer.appendChild(image);
    } else {
      qrContainer.innerHTML = renderQRCodeSVG(selectedData.qrCode);
    }
  }

  doc.close();
};
