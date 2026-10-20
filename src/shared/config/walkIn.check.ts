/**
 * 자체 점검: `JITI_ALIAS="{\"@\":\"$PWD/src\"}" npx jiti src/shared/config/walkIn.check.ts`
 */
import assert from 'node:assert/strict';
import { OCCUPATION_OPTIONS } from '@/entities/form/constants/occupationData';
import { WALK_IN_CATEGORIES } from './walkIn';

// 간편입장 참가 유형의 표기는 직업 선택지와 같다(#732)
const occupationLabel = Object.fromEntries(
  OCCUPATION_OPTIONS.map(({ key, label }) => [key, label]),
);
for (const { value, label } of WALK_IN_CATEGORIES) {
  assert.equal(
    label,
    occupationLabel[value],
    `${value} 라벨이 직업 선택지와 다릅니다`,
  );
}
assert.equal(WALK_IN_CATEGORIES.length, OCCUPATION_OPTIONS.length);

console.log('walkIn.check OK');
