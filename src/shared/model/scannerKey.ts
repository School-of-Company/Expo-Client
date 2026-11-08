// 키보드형 QR 리더기는 물리 키(HID)를 보낸다. 입력 언어가 한글이면 event.key 는 'ㅁ'·'Process' 처럼
// 바뀌지만 event.code(물리 키 위치)는 그대로이므로, code + Shift 로 US 자판 글자를 다시 만든다.
// [Shift 없음, Shift]
const US_LAYOUT: Record<string, readonly [string, string]> = {
  Backquote: ['`', '~'],
  Digit1: ['1', '!'],
  Digit2: ['2', '@'],
  Digit3: ['3', '#'],
  Digit4: ['4', '$'],
  Digit5: ['5', '%'],
  Digit6: ['6', '^'],
  Digit7: ['7', '&'],
  Digit8: ['8', '*'],
  Digit9: ['9', '('],
  Digit0: ['0', ')'],
  Minus: ['-', '_'],
  Equal: ['=', '+'],
  BracketLeft: ['[', '{'],
  BracketRight: [']', '}'],
  Backslash: ['\\', '|'],
  Semicolon: [';', ':'],
  Quote: ["'", '"'],
  Comma: [',', '<'],
  Period: ['.', '>'],
  Slash: ['/', '?'],
  Space: [' ', ' '],
};

export type ScannerKeyEvent = Pick<
  KeyboardEvent,
  'key' | 'code' | 'shiftKey'
> & {
  getModifierState?: (key: string) => boolean;
};

const LETTER_CODE = /^Key([A-Z])$/;

export const isScannerEnter = ({ key, code }: ScannerKeyEvent) =>
  key === 'Enter' ||
  (key === 'Process' && (code === 'Enter' || code === 'NumpadEnter'));

// 영문 입력기에서 리더기가 내는 글자(공백~물결). 이미 이 범위면 event.key 를 그대로 믿는다
const PRINTABLE_ASCII = /^[\x20-\x7e]$/;

/**
 * 리더기 입력으로 모을 글자를 돌려준다. 모으지 않을 키(Shift·Tab 등)는 null.
 * - event.key 가 영문·숫자·기호면 지금처럼 그대로 쓴다. 영문 입력기 동작은 바뀌지 않고,
 *   Shift 없이 '{' 를 보내는 가상 키보드·소프트웨어 입력도 지금처럼 받는다.
 * - 한글 자모('ㅁ')·조합 중('Process')처럼 깨진 키만 물리 키(code) + Shift 로 US 자판 글자를 만든다.
 * - 대응표에 없는 키는 지금처럼 event.key 를 쓴다(예: 텐키 숫자).
 */
export const toScannerChar = (event: ScannerKeyEvent): string | null => {
  const { key, code, shiftKey } = event;

  if (PRINTABLE_ASCII.test(key)) return key;

  const letter = LETTER_CODE.exec(code ?? '');
  if (letter) {
    // 영문 입력기와 같게 CapsLock 이 켜져 있으면 대소문자를 뒤집는다
    const capsLock = event.getModifierState?.('CapsLock') ?? false;
    const upper = shiftKey !== capsLock;
    return upper ? letter[1] : letter[1].toLowerCase();
  }

  const mapped = code ? US_LAYOUT[code] : undefined;
  if (mapped) return mapped[shiftKey ? 1 : 0];

  return key.length === 1 ? key : null;
};
