/**
 * 자체 점검: `JITI_ALIAS="{\"@\":\"$PWD/src\"}" npx jiti src/shared/model/parseQrScanValue.check.ts`
 */
import assert from 'node:assert/strict';
import { parseQrScanValue } from './parseQrScanValue';

const data = (raw: string) => parseQrScanValue(raw).data;
const failed = (raw: string) => parseQrScanValue(raw).error !== null;

assert.deepEqual(data('{"participantId":42,"code":"abc"}'), {
  participantId: 42,
  code: 'abc',
});
assert.deepEqual(data('{"traineeId":1,"phoneNumber":"010"}'), {
  traineeId: 1,
  phoneNumber: '010',
});
// 숫자 문자열 ID는 숫자로 바꾸고, 모르는 필드와 JSON 안의 token은 버린다
assert.deepEqual(data('{"participantId":"7","code":"x","token":"t","a":1}'), {
  participantId: 7,
  code: 'x',
});

// 종이 QR 토큰(숫자만 있어도 JSON 숫자로 읽지 않는다)
assert.deepEqual(data('Ab3_-xYz0123456789AbCd'), {
  token: 'Ab3_-xYz0123456789AbCd',
});
assert.deepEqual(data('1234567890123456789012'), {
  token: '1234567890123456789012',
});
// 길이는 1~64자면 받는다
assert.deepEqual(data('short-token'), { token: 'short-token' });
assert.deepEqual(data('a'.repeat(64)), { token: 'a'.repeat(64) });

assert.ok(failed('{"participantId":'));
assert.ok(failed('[1,2]'));
assert.ok(failed('a'.repeat(65)));
assert.ok(failed('Ab3_-xYz0123456789AbCd!'));

// Swagger 제약 위반
assert.ok(failed('{"participantId":0,"code":"abc"}'));
assert.ok(failed('{"participantId":-1,"code":"abc"}'));
assert.ok(failed('{"participantId":1.5,"code":"abc"}'));
assert.ok(failed('{"participantId":9007199254740993,"code":"abc"}'));
assert.ok(failed('{"participantId":1,"code":""}'));
assert.ok(failed(`{"participantId":1,"code":"${'c'.repeat(23)}"}`));
assert.ok(failed('{"participantId":1,"code":123}'));
assert.ok(failed(`{"traineeId":1,"phoneNumber":"${'1'.repeat(31)}"}`));
assert.ok(failed('{}'));

console.log('parseQrScanValue ok');
