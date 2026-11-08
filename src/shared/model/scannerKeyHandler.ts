import { isScannerEnter, toScannerChar } from './scannerKey';

// 이 시간 안에 다음 키가 오지 않으면 모으던 값을 버린다(사람이 치는 키는 스캔으로 보지 않는다)
const SCAN_KEY_GAP_MS = 300;

// 입력창에 타이핑하는 키는 스캐너 입력으로 모으지 않는다(직접 입력은 그 입력창이 처리한다)
const isEditableTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

/**
 * USB 스캐너(키보드 HID + Enter)의 keydown 을 모아 Enter 에서 onScan(값)을 부른다.
 * React 와 무관한 순수 함수라 useQRScanner.check.ts 가 브라우저 없이 그대로 점검한다
 */
export const createScannerKeyHandler = (onScan: (raw: string) => void) => {
  let buffer = '';
  let isScanning = false;
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const clearGapTimer = () => {
    if (timeout) clearTimeout(timeout);
    timeout = null;
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    // 한글 입력기 상태(조합 중 'Process' 포함)에서도 물리 키로 같은 글자를 얻는다
    const isEnter = isScannerEnter(event);
    const char = isEnter ? null : toScannerChar(event);
    if (!isEnter && char === null) return;
    if (isEditableTarget(event.target)) return;

    // 문자 없이 Enter만 온 것은 스캔이 아니다. 포커스된 버튼의 Enter 동작을 그대로 둔다
    if (isEnter && buffer === '') return;

    const wasScanning = isScanning;
    if (!wasScanning) {
      isScanning = true;
      buffer = '';
    }

    if (isEnter) {
      clearGapTimer();

      // 스캔을 끝내는 Enter가 포커스된 버튼까지 누르지 않게 한다
      event.preventDefault();
      const value = buffer;
      buffer = '';
      isScanning = false;
      onScan(value);
      return;
    }

    // 스캔 도중 들어온 문자(특히 공백)가 포커스된 버튼을 누르지 않게 한다.
    // 첫 글자는 일반 타이핑과 구분할 수 없어 그대로 둔다
    if (wasScanning && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
    }

    buffer += char;

    clearGapTimer();
    timeout = setTimeout(() => {
      buffer = '';
      isScanning = false;
    }, SCAN_KEY_GAP_MS);
  };

  return { handleKeyDown, dispose: clearGapTimer };
};
