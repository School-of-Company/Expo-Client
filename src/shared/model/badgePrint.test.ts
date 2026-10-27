import assert from 'node:assert/strict';
import { test } from 'node:test';
import { BADGE_PRINT_HTML, fillBadge } from './badgePrint';

const fakeDoc = () => {
  const els: Record<string, { textContent: string | null; removed: boolean }> =
    {};
  for (const id of ['badge-school', 'badge-name'])
    els[id] = { textContent: '', removed: false };
  return {
    els,
    doc: {
      getElementById: (id: string) => {
        const el = els[id];
        return {
          get textContent() {
            return el.textContent;
          },
          set textContent(v: string | null) {
            el.textContent = v;
          },
          remove: () => {
            el.removed = true;
          },
        };
      },
    },
  };
};

test('소속과 이름을 별도 요소에 넣는다', () => {
  const { doc, els } = fakeDoc();
  fillBadge(doc, { school: '가나다교육청 라마과', name: '김가상' });
  assert.equal(els['badge-school'].textContent, '가나다교육청 라마과');
  assert.equal(els['badge-name'].textContent, '김가상');
});

test('소속이 null·빈값·공백이면 소속 줄을 뺀다', () => {
  for (const school of [null, undefined, '', '   ']) {
    const { doc, els } = fakeDoc();
    fillBadge(doc, { school, name: '김가상' });
    assert.equal(els['badge-school'].removed, true);
    assert.equal(els['badge-school'].textContent, '');
  }
});

test('HTML 형태 문자열도 텍스트로만 들어간다', () => {
  const { doc, els } = fakeDoc();
  fillBadge(doc, { school: '<b>x</b>', name: '<img src=x onerror=alert(1)>' });
  assert.equal(els['badge-school'].textContent, '<b>x</b>');
  assert.equal(els['badge-name'].textContent, '<img src=x onerror=alert(1)>');
});

test('명찰 마크업에 QR·유형·임시 문구가 없고 이름이 소속보다 크다', () => {
  assert.doesNotMatch(BADGE_PRINT_HTML, /qr|type|임시/i);
  const size = (cls: string) =>
    Number(
      new RegExp(`\\.${cls}\\s*{[^}]*font-size:\\s*(\\d+)px`).exec(
        BADGE_PRINT_HTML,
      )?.[1],
    );
  assert.ok(size('badge-name') > size('badge-school'));
});
