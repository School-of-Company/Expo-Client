/**
 * 자체 점검: `node --experimental-strip-types src/features/survey-answer/lib/giftPickup.check.ts`
 */
import assert from 'node:assert/strict';
import { giftTokenStorageKey, isPickupDone } from './giftPickup.ts';

// 박람회마다 저장 위치가 다르다
assert.notEqual(giftTokenStorageKey('a'), giftTokenStorageKey('b'));

// 서버가 claimed:true 라고 확정한 응답만 완료다. 없거나 false·그 밖의 값은 완료가 아니다
assert.equal(isPickupDone({ claimed: true }), true);
assert.equal(isPickupDone({ claimed: false }), false);
assert.equal(isPickupDone({}), false);
assert.equal(isPickupDone(undefined), false);
assert.equal(isPickupDone({ claimed: 'true' as never }), false);

console.log('giftPickup.check: ok');
