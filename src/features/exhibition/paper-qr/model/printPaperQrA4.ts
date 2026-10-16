'use client';

import { renderQRCodeSVG } from '@/shared/model';
import { PaperQrItem } from '../api/qrTokensApi';
import { getCategoryLabel, getCategoryPrintColor } from './constants';

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
  body {
    font-family: 'Pretendard', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Arial', sans-serif;
    color: #121212;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .page {
    display: grid;
    grid-template-columns: repeat(${COLUMNS}, 1fr);
    grid-auto-rows: 68mm;
    width: 190mm;
    break-after: page;
    page-break-after: always;
  }
  .page:last-child { break-after: auto; page-break-after: auto; }
  /* 바깥 점선은 자르는 선, 안쪽 카드가 실제 입장권이다 */
  .ticket {
    border: 0.2mm dashed #bdbdbd;
    padding: 3mm;
    break-inside: avoid;
    page-break-inside: avoid;
  }
  .card {
    height: 100%;
    border: 0.3mm solid #d3d3d3;
    border-radius: 2.5mm;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .band {
    padding: 2mm 3mm;
    color: #fff;
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 2mm;
  }
  .category { font-size: 12pt; font-weight: 700; line-height: 1.2; }
  .kind { font-size: 7pt; font-weight: 600; letter-spacing: 0.04em; opacity: 0.9; }
  .body {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.5mm;
    padding: 2mm 3mm;
  }
  .expo {
    font-size: 8pt;
    font-weight: 700;
    line-height: 1.25;
    text-align: center;
    word-break: keep-all;
    max-height: 2.5em;
    overflow: hidden;
  }
  .qr { width: 34mm; height: 34mm; }
  .qr svg { width: 100%; height: 100%; display: block; }
  .code {
    font-family: 'SF Mono', 'Menlo', 'Consolas', monospace;
    font-size: 9pt;
    font-weight: 700;
    letter-spacing: 0.06em;
  }
  .note { font-size: 6.5pt; color: #646464; line-height: 1.2; }
`;

// 숨긴 iframe으로 인쇄한다. printPaperQrLabels와 같은 방식이다
export const printPaperQrA4 = (
  items: PaperQrItem[],
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

    // 박람회 이름은 외부 입력값이라 textContent로만 넣는다
    for (let start = 0; start < items.length; start += TICKETS_PER_PAGE) {
      const page = doc.createElement('div');
      page.className = 'page';

      items
        .slice(start, start + TICKETS_PER_PAGE)
        .forEach(({ category, token, code }) => {
          const ticket = doc.createElement('div');
          ticket.className = 'ticket';
          const card = doc.createElement('div');
          card.className = 'card';
          ticket.appendChild(card);

          // 구분은 띠 색과 글로 함께 보여 흑백 인쇄에서도 읽힌다
          const band = doc.createElement('div');
          band.className = 'band';
          band.style.background = getCategoryPrintColor(category);
          const categoryText = doc.createElement('div');
          categoryText.className = 'category';
          categoryText.textContent = getCategoryLabel(category);
          band.appendChild(categoryText);
          const kindText = doc.createElement('div');
          kindText.className = 'kind';
          kindText.textContent = '입장권';
          band.appendChild(kindText);
          card.appendChild(band);

          const body = doc.createElement('div');
          body.className = 'body';

          const expoText = doc.createElement('div');
          expoText.className = 'expo';
          expoText.textContent = expoTitle;
          body.appendChild(expoText);

          const qr = doc.createElement('div');
          qr.className = 'qr';
          qr.innerHTML = renderQRCodeSVG(token);
          body.appendChild(qr);

          const tokenText = doc.createElement('div');
          tokenText.className = 'code';
          // 분실 신고 때 이 코드로 사용 중지한다
          tokenText.textContent = code;
          body.appendChild(tokenText);

          const note = doc.createElement('div');
          note.className = 'note';
          note.textContent = '박람회 입장 전용 · 하루 1회';
          body.appendChild(note);

          card.appendChild(body);
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
