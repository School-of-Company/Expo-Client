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

export const printBadge = (selectedData: {
  name: string;
  // 소속이 없으면 이름만 찍는다
  school?: string | null;
}) => {
  const printWindow = window.open('', '_blank');

  if (!printWindow) return;

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
            .badge .school {
              font-size: 28px;
              margin: 0 0 12px;
              color: #333;
            }
            .badge h1 {
              font-size: 48px;
              margin: 0;
              font-weight: bold;
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
            <p class="school" id="badge-school"></p>
            <h1 id="badge-name"></h1>
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

  // 외부 입력값이므로 HTML 파싱 없이 textContent 로만 주입한다.
  const schoolElement = doc.getElementById('badge-school');
  if (schoolElement) {
    if (selectedData.school) schoolElement.textContent = selectedData.school;
    else schoolElement.remove();
  }

  const nameElement = doc.getElementById('badge-name');
  if (nameElement) nameElement.textContent = selectedData.name;

  doc.close();
};
