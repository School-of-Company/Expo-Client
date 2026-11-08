/**
 * 자체 점검: `JITI_ALIAS="{\"@\":\"$PWD/src\"}" npx jiti src/shared/model/useQRScanner.check.ts`
 * useQRScanner 의 키 처리기(createScannerKeyHandler)와 글자 규칙(toScannerChar)을 점검한다.
 * jsdom 이 없어 HTMLElement·버튼만 최소한으로 흉내 낸다(실제 브라우저·스캐너는 쓰지 않는다)
 */
import assert from 'node:assert/strict';
import { parseQrScanValue } from './parseQrScanValue';
import { toScannerChar } from './scannerKey';
import { createScannerKeyHandler } from './scannerKeyHandler';

// --- 최소 DOM 흉내 ---
class FakeElement {
  isContentEditable = false;
  clicks = 0;
  constructor(public tagName: string) {}
}
Object.assign(globalThis, { HTMLElement: FakeElement });

type KeyInit = {
  key: string;
  target: FakeElement;
  ctrlKey?: boolean;
  code?: string;
  shiftKey?: boolean;
  capsLock?: boolean;
};

let handleKeyDown: (event: KeyboardEvent) => void = () => {};

// 브라우저처럼: 기본 동작이 막히지 않은 Enter 는 포커스된 버튼을 누른다
const press = ({
  key,
  target,
  ctrlKey = false,
  code = '',
  shiftKey = false,
  capsLock = false,
}: KeyInit) => {
  const event = Object.assign(new Event('keydown', { cancelable: true }), {
    key,
    code,
    shiftKey,
    ctrlKey,
    metaKey: false,
    altKey: false,
    getModifierState: (name: string) => name === 'CapsLock' && capsLock,
  });
  Object.defineProperty(event, 'target', { value: target });
  handleKeyDown(event as unknown as KeyboardEvent);
  if (key === 'Enter' && target.tagName === 'BUTTON' && !event.defaultPrevented)
    target.clicks += 1;
  return event;
};

// useQRScanner 와 같이 Enter 에서 모은 값을 parseQrScanValue 로 넘긴다
const mount = () => {
  const scanned: unknown[] = [];
  const handler = createScannerKeyHandler((raw) =>
    scanned.push(parseQrScanValue(raw).data),
  );
  handleKeyDown = handler.handleKeyDown;
  return { scanned, unmount: handler.dispose };
};

const VALID = '{"participantId":1,"code":"abc12"}';

// (a) 버튼에 포커스가 있어도 스캔이 처리되고, 끝 Enter 가 버튼을 누르지 않는다
{
  const { scanned, unmount } = mount();
  const button = new FakeElement('BUTTON');
  VALID.split('').forEach((key) => press({ key, target: button }));
  const enter = press({ key: 'Enter', target: button });
  assert.deepEqual(scanned, [{ participantId: 1, code: 'abc12' }]);
  assert.equal(enter.defaultPrevented, true);
  assert.equal(button.clicks, 0);
  unmount();
}

// 스캔 도중의 공백은 막고, 첫 글자는 막지 않는다
{
  const { unmount } = mount();
  const button = new FakeElement('BUTTON');
  assert.equal(press({ key: 'a', target: button }).defaultPrevented, false);
  assert.equal(press({ key: ' ', target: button }).defaultPrevented, true);
  press({ key: 'Enter', target: button });
  unmount();
}

// (b) 문자 없이 Enter 만 오면 스캔이 아니고, 기본 동작도 막지 않는다
{
  const { scanned, unmount } = mount();
  const button = new FakeElement('BUTTON');
  const enter = press({ key: 'Enter', target: button });
  assert.equal(scanned.length, 0);
  assert.equal(enter.defaultPrevented, false);
  assert.equal(button.clicks, 1);
  unmount();
}

// (c) 입력창에 치는 키는 여전히 무시한다
{
  const { scanned, unmount } = mount();
  const input = new FakeElement('INPUT');
  const events = VALID.split('').map((key) => press({ key, target: input }));
  const enter = press({ key: 'Enter', target: input });
  assert.equal(scanned.length, 0);
  assert.equal(enter.defaultPrevented, false);
  assert.ok(events.every((e) => !e.defaultPrevented));
  unmount();
}

// --- 한글 입력기 상태 흉내 ---
// 영문 US 자판에서 글자를 치는 물리 키(code)와 Shift 여부
const US_KEY: Record<string, [string, boolean]> = {
  '{': ['BracketLeft', true],
  '}': ['BracketRight', true],
  '"': ['Quote', true],
  ':': ['Semicolon', true],
  ',': ['Comma', false],
  '.': ['Period', false],
  '-': ['Minus', false],
  _: ['Minus', true],
  ' ': ['Space', false],
};
const codeOf = (char: string): [string, boolean] => {
  if (/[a-z]/.test(char)) return [`Key${char.toUpperCase()}`, false];
  if (/[A-Z]/.test(char)) return [`Key${char}`, true];
  if (/[0-9]/.test(char)) return [`Digit${char}`, false];
  return US_KEY[char];
};
// 두벌식: 대·소문자 모두 같은 자모가 나오는 키가 대부분이다(쌍자음 키 제외)
// prettier-ignore
const JAMO: Record<string, string> = {
  KeyA: 'ㅁ', KeyB: 'ㅠ', KeyC: 'ㅊ', KeyD: 'ㅇ', KeyE: 'ㄷ', KeyF: 'ㄹ',
  KeyG: 'ㅎ', KeyH: 'ㅗ', KeyI: 'ㅑ', KeyJ: 'ㅓ', KeyK: 'ㅏ', KeyL: 'ㅣ',
  KeyM: 'ㅡ', KeyN: 'ㅜ', KeyO: 'ㅐ', KeyP: 'ㅔ', KeyQ: 'ㅂ', KeyR: 'ㄱ',
  KeyS: 'ㄴ', KeyT: 'ㅅ', KeyU: 'ㅕ', KeyV: 'ㅍ', KeyW: 'ㅈ', KeyX: 'ㅌ',
  KeyY: 'ㅛ', KeyZ: 'ㅋ',
};

type ImeMode = 'jamo' | 'process';

// 한글 입력기에서 리더기가 char 를 보낼 때의 keydown. 'process' 는 글자 키가 조합 중으로 온다
const hangulKey = (char: string, mode: ImeMode) => {
  const [code, shiftKey] = codeOf(char);
  // 기호·숫자는 한글 입력기에서도 그대로
  const key = JAMO[code] ? (mode === 'process' ? 'Process' : JAMO[code]) : char;
  return { key, code, shiftKey };
};

const scanHangul = (value: string, target: FakeElement, mode: ImeMode) => {
  for (const char of value) press({ ...hangulKey(char, mode), target });
  // 끝 Enter 도 조합 중이면 Process 로 올 수 있다
  press({
    key: mode === 'process' ? 'Process' : 'Enter',
    code: 'Enter',
    target,
  });
};

// 종이 QR 토큰(base64url, 대소문자 구분)
const PAPER_TOKEN = 'aB3_xY-Zq9WkLmN0';

// (d) 자모로 들어와도(key: 'ㅁ', code: 'KeyA') 원래 값으로 모은다
{
  const { scanned, unmount } = mount();
  scanHangul(VALID, new FakeElement('BODY'), 'jamo');
  assert.deepEqual(scanned, [{ participantId: 1, code: 'abc12' }]);
  unmount();
}

// (e) 조합 중('Process')으로 와도 버리지 않고 같은 규칙으로 모은다
{
  const { scanned, unmount } = mount();
  scanHangul(VALID, new FakeElement('BODY'), 'process');
  assert.deepEqual(scanned, [{ participantId: 1, code: 'abc12' }]);
  unmount();
}

// (f) 대문자 + Shift 는 대문자로 복원한다. 자모로는 'a'·'A' 가 같은 'ㅁ' 이라 event.key 로는 구분할 수 없다
for (const mode of ['jamo', 'process'] as const) {
  const { scanned, unmount } = mount();
  scanHangul(PAPER_TOKEN, new FakeElement('BUTTON'), mode);
  assert.deepEqual(scanned, [{ token: PAPER_TOKEN }], mode);
  unmount();
}

// (g) 입력창에서는 한글 입력기 상태여도 리더기 입력으로 모으지 않는다(직접 입력은 지금 동작 유지)
{
  const { scanned, unmount } = mount();
  scanHangul(VALID, new FakeElement('INPUT'), 'process');
  assert.equal(scanned.length, 0);
  unmount();
}

// 글자 단위 규칙
{
  const collect = (value: string, mode: ImeMode, capsLock = false) =>
    value
      .split('')
      .map((char) =>
        toScannerChar({
          ...hangulKey(char, mode),
          getModifierState: (name) => name === 'CapsLock' && capsLock,
        }),
      )
      .join('');
  const json = '{"participantId":12,"code":"Ab_c-D.9 Z"}';
  assert.equal(collect(json, 'jamo'), json);
  assert.equal(collect(json, 'process'), json);
  // CapsLock 이 켜진 채 리더기가 Shift 로 대문자를 보내면 영문 입력기처럼 뒤집힌다(기존 동작과 같음)
  assert.equal(collect('aB', 'jamo', true), 'Ab');
  // 대응표에 없는 키는 event.key 를 쓴다(텐키 숫자). 모을 글자가 없는 키는 null
  assert.equal(
    toScannerChar({ key: '7', code: 'Numpad7', shiftKey: false }),
    '7',
  );
  assert.equal(
    toScannerChar({ key: 'Shift', code: 'ShiftLeft', shiftKey: true }),
    null,
  );
  // 이미 영문·기호로 온 키는 code·Shift 와 어긋나도 event.key 를 믿는다(Shift 없이 '{' 를 보내는 가상 입력)
  assert.equal(
    toScannerChar({ key: '{', code: 'BracketLeft', shiftKey: false }),
    '{',
  );
  // code 가 없는 환경은 지금처럼 event.key
  assert.equal(toScannerChar({ key: 'x', code: '', shiftKey: false }), 'x');
}

console.log('useQRScanner.check: ok');
