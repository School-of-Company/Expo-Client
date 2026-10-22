'use client';

import { QRCodeSVG } from 'qrcode.react';
import { createElement } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

export const renderQRCodeSVG = (value: string, size = 130): string => {
  const host = document.createElement('div');
  const root = createRoot(host);

  flushSync(() => {
    root.render(createElement(QRCodeSVG, { value, size }));
  });

  const markup = host.innerHTML;
  root.unmount();

  return markup;
};

// 이미지로 온 QR이면 img src로 쓸 값, QR 값 문자열이면 null
// 랜덤 code에 'base64'가 들어가도 오판하지 않도록 접두어로만 판정한다
const toQrImageSrc = (qrCode: string): string | null => {
  if (qrCode.startsWith('data:image/')) return qrCode;
  if (qrCode.startsWith('/9j/')) return `data:image/jpeg;base64,${qrCode}`;
  if (qrCode.startsWith('iVBORw0KGgo'))
    return `data:image/png;base64,${qrCode}`;
  return null;
};

// 인쇄 창이 작게 열려도 명찰이 한 화면을 채우도록 QR 을 크게 그린다
const BADGE_QR_SIZE = 260;

export const printBadge = (selectedData: {
  name: string;
  // Swagger는 string이지만 예시가 객체라 객체로 와도 JSON 문자열로 바꿔 그린다
  qrCode: unknown;
  // QR 아래 이름 옆에 보여 줄 참가자 유형(교사·일반 등)
  typeLabel?: string;
  isTemporary: boolean;
}) => {
  const printWindow = window.open('', '_blank');

  if (!printWindow) return;

  const qrValue =
    typeof selectedData.qrCode === 'string'
      ? selectedData.qrCode
      : (JSON.stringify(selectedData.qrCode) ?? '');
  const qrImageSrc = toQrImageSrc(qrValue);

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
              font-size: 32px;
              margin: 16px 0 6px;
              font-weight: bold;
            }
            .badge .type {
              font-size: 22px;
              color: #333;
            }
            .badge p {
              margin: 5px 0;
              font-size: 16px;
              color: #555;
            }
            .qr-container {
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
            ${selectedData.isTemporary ? `<p style="font-size:14px;">(임시 QR)</p>` : ''}
            <div class="qr-container" id="badge-qr"></div>
            <h1 id="badge-name"></h1>
            <p class="type" id="badge-type"></p>
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

  const typeElement = doc.getElementById('badge-type');
  if (typeElement) {
    if (selectedData.typeLabel)
      typeElement.textContent = selectedData.typeLabel;
    else typeElement.remove();
  }

  const qrContainer = doc.getElementById('badge-qr');
  if (qrContainer) {
    if (qrImageSrc) {
      const image = doc.createElement('img');
      image.src = qrImageSrc;
      image.alt = 'QR Code';
      image.width = BADGE_QR_SIZE;
      image.height = BADGE_QR_SIZE;
      qrContainer.appendChild(image);
    } else {
      qrContainer.innerHTML = renderQRCodeSVG(qrValue, BADGE_QR_SIZE);
    }
  }

  doc.close();
};
