/**
 * 자체 점검: `JITI_ALIAS="{\"@\":\"$PWD/src\"}" npx jiti src/features/exhibition/check-in/model/mergeEntryPages.check.ts`
 */
import assert from 'node:assert/strict';
import { mergeEntryPages } from './mergeEntryPages';

const row = (id: number, participationType: string, name = `n${id}`) => ({
  id,
  participationType,
  name,
  phoneNumber: null,
  personalInformationStatus: true,
  badge: null,
  firstEnteredTime: '10:00',
  inside: true,
});

// 페이지 경계에서 겹친 행은 처음 것만 남고, 같은 ID 라도 유형이 다르면 다른 사람이다
const merged = mergeEntryPages([
  { entries: [row(1, 'STANDARD'), row(2, 'STANDARD')] },
  {
    entries: [row(2, 'STANDARD', 'dup'), row(2, 'TRAINEE'), row(3, 'STANDARD')],
  },
]);
assert.deepEqual(
  merged.map((r) => `${r.participationType}-${r.id}-${r.name}`),
  ['STANDARD-1-n1', 'STANDARD-2-n2', 'TRAINEE-2-n2', 'STANDARD-3-n3'],
);
assert.deepEqual(mergeEntryPages([]), []);

console.log('mergeEntryPages.check: ok');
