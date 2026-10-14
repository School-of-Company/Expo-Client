'use client';

import { renderQRCodeSVG } from '@/shared/model';
import { getCategoryLabel } from './constants';
import { PaperQrBatch } from './issuePaperQrTokens';

interface PrintOptions {
  expoTitle: string;
}

// A4 한 장에 3열 4행. 잘라 쓰도록 칸마다 점선을 두른다
const COLUMNS = 3;
const ROWS = 4;
const TICKETS_PER_PAGE = COLUMNS * ROWS;

const A4_STYLE = `
  @page { size: A4; margin: 10mm; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body { font-family: 'Pretendard', 'Arial', sans-serif; color: #000; }
  .page {
    display: grid;
    grid-template-columns: repeat(${COLUMNS}, 1fr);
    grid-auto-rows: 68mm;
    width: 190mm;
    break-after: page;
    page-break-after: always;
  }
  .page:last-child { break-after: auto; page-break-after: auto; }
  .ticket {
    border: 1px dashed #999;
    padding: 4mm;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2mm;
    overflow: hidden;
    break-inside: avoid;
    page-break-inside: avoid;
  }
  .category { font-size: 13pt; font-weight: 700; line-height: 1.2; }
  .qr { width: 40mm; height: 40mm; }
  .qr svg { width: 100%; height: 100%; display: block; }
  .token { font-size: 7pt; color: #555; line-height: 1.2; }
  .expo {
    font-size: 7pt;
    line-height: 1.2;
    text-align: center;
    word-break: keep-all;
  }
`;

// 토큰 전체를 글자로 찍지 않고, 현장에서 장을 구분할 끝자리만 보인다
export const getTokenTail = (token: string) => token.slice(-6);

// 숨긴 iframe으로 인쇄한다. printPaperQrLabels와 같은 방식이다
export const printPaperQrA4 = (
  batches: PaperQrBatch[],
  { expoTitle }: PrintOptions,
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
      `<!doctype html><html><head><meta charset="utf-8"><title>종이 QR 입장권</title><style>${A4_STYLE}</style></head><body></body></html>`,
    );
    doc.close();

    const tickets = batches.flatMap(({ category, tokens }) =>
      tokens.map((token) => ({ category, token })),
    );

    // 박람회 이름은 외부 입력값이라 textContent로만 넣는다
    for (let start = 0; start < tickets.length; start += TICKETS_PER_PAGE) {
      const page = doc.createElement('div');
      page.className = 'page';

      tickets
        .slice(start, start + TICKETS_PER_PAGE)
        .forEach(({ category, token }) => {
          const ticket = doc.createElement('div');
          ticket.className = 'ticket';

          const categoryText = doc.createElement('div');
          categoryText.className = 'category';
          categoryText.textContent = `${getCategoryLabel(category)} 입장권`;
          ticket.appendChild(categoryText);

          const qr = doc.createElement('div');
          qr.className = 'qr';
          qr.innerHTML = renderQRCodeSVG(token);
          ticket.appendChild(qr);

          const tokenText = doc.createElement('div');
          tokenText.className = 'token';
          tokenText.textContent = `토큰 ${getTokenTail(token)}`;
          ticket.appendChild(tokenText);

          const expoText = doc.createElement('div');
          expoText.className = 'expo';
          expoText.textContent = expoTitle;
          ticket.appendChild(expoText);

          page.appendChild(ticket);
        });

      doc.body.appendChild(page);
    }

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
