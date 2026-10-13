/**
 * 자체 점검: `node --experimental-strip-types src/features/application/lib/resolveTrainingProgramIds.check.ts`
 */
import assert from 'node:assert/strict';
import { resolveTrainingProgramIds } from './resolveTrainingProgramIds.ts';

const programs = [
  { id: 11, title: '연수A' },
  { id: 12, title: '연수B (변경됨)' },
];

assert.deepEqual(resolveTrainingProgramIds(['연수A'], programs), [11]);
assert.deepEqual(resolveTrainingProgramIds(['연수A', '연수A'], programs), [11]);
assert.throws(() => resolveTrainingProgramIds([], programs), /1개 이상/);
assert.throws(
  () => resolveTrainingProgramIds(['연수B'], programs),
  /바뀌었습니다/,
);
assert.throws(
  () => resolveTrainingProgramIds(['연수A', '연수B'], programs),
  /바뀌었습니다/,
);

console.log('resolveTrainingProgramIds: ok');
