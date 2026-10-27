/**
 * 자체 점검: `node --experimental-strip-types src/features/survey-answer/lib/giftPickup.check.ts`
 */
import assert from 'node:assert/strict';
import {
  isValidStaffPin,
  keepDigits,
  remainingLockSeconds,
  toPinFailureNotice,
} from './giftPickup.ts';

// PIN 형식: 숫자 4~8자리만
assert.equal(isValidStaffPin('1234'), true);
assert.equal(isValidStaffPin('12345678'), true);
assert.equal(isValidStaffPin('123'), false);
assert.equal(isValidStaffPin('123456789'), false);
assert.equal(isValidStaffPin('12a4'), false);
assert.equal(isValidStaffPin(' 1234'), false);
assert.equal(isValidStaffPin(''), false);

// 입력은 숫자만 남기고 8자리까지만 받는다
assert.equal(keepDigits('12 3-4a5'), '12345');
assert.equal(keepDigits('1234567890'), '12345678');

// PIN 오류: 남은 횟수가 있으면 함께 안내한다
assert.deepEqual(
  toPinFailureNotice({
    code: 'GIFT_PIN_INVALID',
    message: 'x',
    attemptsLeft: 3,
  }),
  { kind: 'WRONG', text: 'PIN이 맞지 않습니다. 3번 더 틀리면 잠시 잠깁니다.' },
);
assert.equal(
  toPinFailureNotice({ code: 'GIFT_PIN_INVALID', message: 'x' }).text,
  'PIN이 맞지 않습니다.',
);

// 잠금: 해제까지 초를 담는다
const locked = toPinFailureNotice({
  code: 'GIFT_PIN_LOCKED',
  message: 'x',
  retryAfterSeconds: 300,
});
assert.equal(locked.kind, 'LOCKED');
assert.equal(locked.kind === 'LOCKED' && locked.retryAfterSeconds, 300);

// 잘못된 토큰은 따로 구분하고, 모르는 코드는 서버 문구를 그대로 보인다
assert.equal(
  toPinFailureNotice({ code: 'GIFT_PICKUP_TOKEN_INVALID', message: '없음' })
    .kind,
  'TOKEN_INVALID',
);
assert.deepEqual(toPinFailureNotice({ code: 'X', message: '서버 문구' }), {
  kind: 'OTHER',
  text: '서버 문구',
});

// 잠금 카운트다운
assert.equal(remainingLockSeconds(null, 1000), 0);
assert.equal(remainingLockSeconds(11_000, 1_000), 10);
assert.equal(remainingLockSeconds(11_000, 10_500), 1);
assert.equal(remainingLockSeconds(11_000, 12_000), 0);

console.log('giftPickup.check: ok');
