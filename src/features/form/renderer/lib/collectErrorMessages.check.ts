/**
 * 자체 점검: `node --experimental-strip-types src/features/form/renderer/lib/collectErrorMessages.check.ts`
 */
import assert from 'node:assert/strict';
import { collectErrorMessages } from './collectErrorMessages.ts';

// 평평한 오류
assert.deepEqual(
  collectErrorMessages({
    name: { type: 'required', message: '이름을 입력해주세요', ref: {} },
  }),
  ['이름을 입력해주세요'],
);

// 동행자 배열 오류: 바깥에 message 가 없어도 안쪽 문구를 모은다(빈 항목 없음)
assert.deepEqual(
  collectErrorMessages({
    companions: [
      undefined,
      {
        affiliation: { type: 'maxLength', message: '소속은 100자 이하입니다' },
      },
    ],
  }),
  ['소속은 100자 이하입니다'],
);

// 같은 문구는 한 번만, ref(DOM)는 따라 들어가지 않는다
const dom = { message: '요소 안의 문구', children: [] };
assert.deepEqual(
  collectErrorMessages({
    a: { message: '필수입니다', ref: dom },
    b: { message: '필수입니다' },
  }),
  ['필수입니다'],
);

// 문구가 없는 오류만 있으면 빈 목록
assert.deepEqual(collectErrorMessages({ a: { type: 'required' } }), []);
assert.deepEqual(collectErrorMessages(undefined), []);

console.log('collectErrorMessages.check: ok');
