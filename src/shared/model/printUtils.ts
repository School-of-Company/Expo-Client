'use client';

import { QRCodeSVG } from 'qrcode.react';
import { createElement } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { BADGE_PRINT_HTML, fillBadge } from './badgePrint';

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
  school?: string | null;
  name: string;
}) => {
  const printWindow = window.open('', '_blank');

  if (!printWindow) return;

  printWindow.document.write(BADGE_PRINT_HTML);
  fillBadge(printWindow.document, selectedData);
  printWindow.document.close();
};
