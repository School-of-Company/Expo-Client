/**
 * 자체 점검: `JITI_ALIAS="{\"@\":\"$PWD/src\"}" npx jiti src/shared/model/useQRScanner.check.ts`
 * jsdom 이 없어 window·버튼·React 훅을 최소한으로 흉내 낸다(실제 브라우저·스캐너는 쓰지 않는다)
 */
import assert from 'node:assert/strict';
import * as ReactModule from 'react';
import { useQRScanner } from './useQRScanner';

// --- 최소 DOM 흉내 ---
class FakeElement {
  isContentEditable = false;
  clicks = 0;
  constructor(public tagName: string) {}
}
const fakeWindow = new EventTarget();
Object.assign(globalThis, { HTMLElement: FakeElement, window: fakeWindow });

// --- 최소 React 훅 흉내(useEffect 는 즉시 실행, 정리 함수는 보관) ---
// 같은 모듈 객체의 훅을 바꿔치기한다
const React = (ReactModule as { default?: object }).default ?? ReactModule;
const cleanups: Array<() => void> = [];
let refs: Array<{ current: unknown }> = [];
let refIndex = 0;
Object.assign(React, {
  useRef: (initial: unknown) => {
    refs[refIndex] ??= { current: initial };
    return refs[refIndex++];
  },
  useCallback: (fn: unknown) => fn,
  useEffect: (fn: () => void | (() => void)) => {
    const cleanup = fn();
    if (cleanup) cleanups.push(cleanup);
  },
});

type KeyInit = { key: string; target: FakeElement; ctrlKey?: boolean };

// 브라우저처럼: 기본 동작이 막히지 않은 Enter 는 포커스된 버튼을 누른다
const press = ({ key, target, ctrlKey = false }: KeyInit) => {
  const event = Object.assign(new Event('keydown', { cancelable: true }), {
    key,
    ctrlKey,
    metaKey: false,
    altKey: false,
  });
  Object.defineProperty(event, 'target', { value: target });
  fakeWindow.dispatchEvent(event);
  if (key === 'Enter' && target.tagName === 'BUTTON' && !event.defaultPrevented)
    target.clicks += 1;
  return event;
};

const mount = () => {
  refs = [];
  refIndex = 0;
  cleanups.length = 0;
  const scanned: unknown[] = [];
  useQRScanner((value: unknown) => scanned.push(value));
  return { scanned, unmount: () => cleanups.forEach((fn) => fn()) };
};

const VALID = '{"participantId":1,"code":"abc12"}';

// (a) 버튼에 포커스가 있어도 스캔이 처리되고, 끝 Enter 가 버튼을 누르지 않는다
{
  const { scanned, unmount } = mount();
  const button = new FakeElement('BUTTON');
  VALID.split('').forEach((key) => press({ key, target: button }));
  const enter = press({ key: 'Enter', target: button });
  assert.equal(scanned.length, 1);
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

console.log('useQRScanner.check: ok');
