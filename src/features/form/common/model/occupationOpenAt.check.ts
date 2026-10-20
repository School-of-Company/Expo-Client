/**
 * 자체 점검: `node --experimental-strip-types src/features/form/common/model/occupationOpenAt.check.ts`
 */
import assert from 'node:assert/strict';
import {
  formatKst,
  getOccupationOpenAtError,
  toKstInput,
  toOccupationOpenAtRequest,
  toOccupationOpenAtValue,
} from './occupationOpenAt.ts';

// 서버 응답은 UTC 로 와도 한국 시각으로 보인다
assert.equal(toKstInput('2026-10-25T23:30:00.000Z'), '2026-10-26T08:30');
assert.equal(toKstInput('2026-10-26T08:30:00+09:00'), '2026-10-26T08:30');
assert.equal(formatKst('2026-10-25T23:30:00.000Z'), '2026.10.26 08:30');
assert.equal(toKstInput(null), '');

// null·구형 응답(없음)은 끈 상태
assert.deepEqual(toOccupationOpenAtValue(null), { enabled: false, local: '' });
assert.deepEqual(toOccupationOpenAtValue(undefined), {
  enabled: false,
  local: '',
});
assert.deepEqual(toOccupationOpenAtValue('2026-10-25T23:30:00.000Z'), {
  enabled: true,
  local: '2026-10-26T08:30',
});

// 끄면 명시적 null, 켜면 +09:00, 손대지 않으면 원래 값
const original = '2026-10-25T23:30:15.000Z';
assert.equal(
  toOccupationOpenAtRequest({ enabled: false, local: '2026-10-26T08:30' }),
  null,
);
assert.equal(
  toOccupationOpenAtRequest({ enabled: true, local: '2026-10-22T09:00' }),
  '2026-10-22T09:00:00+09:00',
);
assert.equal(
  toOccupationOpenAtRequest(toOccupationOpenAtValue(original), original),
  original,
);

// 공통 기간: 시작·마감은 양 끝을 뺀 사이여야 한다
const start = '2026-10-19T15:00:00.000Z'; // 10/20 00:00 KST
const end = '2026-10-30T15:00:00.000Z'; // 10/31 00:00 KST
const at = (local: string) => ({ enabled: true, local });
assert.equal(
  getOccupationOpenAtError({ enabled: false, local: '' }, start, end),
  null,
);
assert.match(getOccupationOpenAtError(at(''), start, end) ?? '', /입력/);
assert.equal(
  getOccupationOpenAtError(at('2026-10-26T08:30'), start, end),
  null,
);
assert.match(
  getOccupationOpenAtError(at('2026-10-20T00:00'), start, end) ?? '',
  /2026\.10\.20 00:00\)보다 늦어야/,
);
assert.match(
  getOccupationOpenAtError(at('2026-10-31T00:00'), start, end) ?? '',
  /마감\(2026\.10\.31 00:00\)보다 일러야/,
);

console.log('occupationOpenAt: ok');
