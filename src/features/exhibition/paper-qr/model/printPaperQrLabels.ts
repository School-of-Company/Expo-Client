'use client';

import { renderQRCodeSVG } from '@/shared/model';
import { PAPER_QR_CATEGORIES } from './constants';
import { PaperQrBatch } from './issuePaperQrTokens';

interface PrintOptions {
  expoTitle: string;
  labelSize: { width: number; height: number };
}

const LABEL_STYLE = (width: number, height: number) => `
  @page { size: ${width}mm ${height}mm; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body { font-family: 'Pretendard', 'Arial', sans-serif; color: #000; }
  .label {
    width: ${width}mm;
    height: ${height}mm;
    padding: 2mm;
    display: flex;
    align-items: center;
    gap: 2mm;
    overflow: hidden;
    break-after: page;
    page-break-after: always;
  }
  .label:last-child { break-after: auto; page-break-after: auto; }
  .qr { flex: none; height: 100%; aspect-ratio: 1 / 1; }
  .qr svg { width: 100%; height: 100%; display: block; }
  .text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1mm; }
  .category { font-size: ${Math.round(height * 0.4)}pt; font-weight: 700; line-height: 1; }
  .expo { font-size: 7pt; line-height: 1.2; word-break: keep-all; }
`;

// 숨긴 iframe으로 인쇄한다. 발급 응답을 기다린 뒤라 새 창은 팝업 차단에 걸린다
export const printPaperQrLabels = (
  batches: PaperQrBatch[],
  { expoTitle, labelSize }: PrintOptions,
): Promise<void> =>
  new Promise((resolve, reject) => {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.cssText =
      'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
    document.body.appendChild(iframe);

    const printWindow = iframe.contentWindow;
    const doc = iframe.contentDocument;
    if (!printWindow || !doc) {
      iframe.remove();
      reject(new Error('인쇄 화면을 열 수 없습니다.'));
      return;
    }

    doc.open();
    doc.write(
      `<!doctype html><html><head><meta charset="utf-8"><title>종이 QR</title><style>${LABEL_STYLE(labelSize.width, labelSize.height)}</style></head><body></body></html>`,
    );
    doc.close();

    // 박람회 이름은 외부 입력값이라 textContent로만 넣는다
    batches.forEach(({ category, tokens }) => {
      const printLabel =
        PAPER_QR_CATEGORIES.find((item) => item.value === category)
          ?.printLabel ?? null;

      tokens.forEach((token) => {
        const label = doc.createElement('div');
        label.className = 'label';

        const qr = doc.createElement('div');
        qr.className = 'qr';
        qr.innerHTML = renderQRCodeSVG(token);
        label.appendChild(qr);

        const text = doc.createElement('div');
        text.className = 'text';
        if (printLabel) {
          const categoryText = doc.createElement('div');
          categoryText.className = 'category';
          categoryText.textContent = printLabel;
          text.appendChild(categoryText);
        }
        const expoText = doc.createElement('div');
        expoText.className = 'expo';
        expoText.textContent = expoTitle;
        text.appendChild(expoText);
        label.appendChild(text);

        doc.body.appendChild(label);
      });
    });

    const cleanup = () => {
      iframe.remove();
      resolve();
    };
    printWindow.addEventListener('afterprint', cleanup, { once: true });
    printWindow.focus();
    printWindow.print();
    // afterprint를 보내지 않는 브라우저 대비
    setTimeout(() => {
      if (iframe.isConnected) cleanup();
    }, 60_000);
  });
