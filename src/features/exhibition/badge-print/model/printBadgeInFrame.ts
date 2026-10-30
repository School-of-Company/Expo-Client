import { BADGE_FRAME_HTML, fillBadge } from '@/shared/model/badgePrint';

/** 인쇄를 요청하기 전에 실패해 종이가 나오지 않은 것이 확실한 경우. 서버가 재시도한다 */
export class BeforePrintError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BeforePrintError';
  }
}

interface BadgeFrameWindow extends Window {
  fitBadge?: () => void;
  waitBadgeFonts?: () => Promise<unknown>;
}

// 인쇄 대화상자·스풀이 iframe 을 읽는 동안 지우지 않도록 잠시 둔다
const FRAME_CLEANUP_DELAY_MS = 5000;

/**
 * 새 창 대신 화면 밖 iframe 에 명찰을 그려 인쇄한다. 새 창은 사용자 클릭 없이 열면 팝업 차단에 걸린다.
 * Chrome `--kiosk-printing` 이면 대화상자 없이 기본 프린터로 나간다.
 * print() 를 부르기 전 실패는 BeforePrintError 로, 부른 뒤에는 성공으로 끝낸다(종이가 나왔는지는 알 수 없다)
 */
export const printBadgeInFrame = async (badge: {
  name: string;
  school: string | null;
}) => {
  const frame = document.createElement('iframe');
  frame.setAttribute('aria-hidden', 'true');
  frame.tabIndex = -1;
  // display:none 이면 일부 브라우저가 인쇄하지 않아 크기를 두고 화면 밖으로 뺀다
  frame.style.cssText =
    'position:fixed;left:-10000px;top:0;width:80mm;height:56mm;border:0;';
  document.body.appendChild(frame);

  const cleanup = () => {
    window.setTimeout(() => frame.remove(), FRAME_CLEANUP_DELAY_MS);
  };

  const frameWindow = frame.contentWindow as BadgeFrameWindow | null;
  const doc = frame.contentDocument;
  if (!frameWindow || !doc) {
    frame.remove();
    throw new BeforePrintError('인쇄 영역을 만들지 못했습니다.');
  }

  try {
    doc.open();
    doc.write(BADGE_FRAME_HTML);
    doc.close();
    fillBadge(doc, badge);
    await frameWindow.waitBadgeFonts?.().catch(() => undefined);
    frameWindow.fitBadge?.();
  } catch (error) {
    frame.remove();
    throw new BeforePrintError(
      error instanceof Error ? error.message : '명찰을 그리지 못했습니다.',
    );
  }

  // print() 가 던져도 iframe 이 남지 않게 한다
  try {
    frameWindow.focus();
    frameWindow.print();
  } finally {
    cleanup();
  }
};
