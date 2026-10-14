/**
 * 자체 점검: `node --experimental-strip-types src/features/application/lib/createSubmissionKeys.check.ts`
 */
import assert from 'node:assert/strict';
import { createSubmissionKeys } from './createSubmissionKeys.ts';

let n = 0;
const keys = createSubmissionKeys(() => `k${++n}`);

// 같은 내용은 같은 키, 내용이 바뀌면 새 키
assert.equal(keys.keyFor('a'), 'k1');
assert.equal(keys.keyFor('a'), 'k1');
assert.equal(keys.keyFor('b'), 'k2');

// reset 뒤에는 같은 내용도 새 키(성공·취소된 대기 재신청)
keys.reset();
assert.equal(keys.keyFor('b'), 'k3');

console.log('createSubmissionKeys checks passed');
