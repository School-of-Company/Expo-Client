/**
 * 자체 점검: `JITI_ALIAS="{\"@\":\"$PWD/src\"}" npx jiti src/shared/model/parseQrScanValue.check.ts`
 */
import assert from 'node:assert/strict';
import { parseQrScanValue } from './parseQrScanValue';

assert.deepEqual(parseQrScanValue('{"participantId":42,"code":"abc"}'), {
  participantId: 42,
  code: 'abc',
});
assert.deepEqual(parseQrScanValue('{"traineeId":1,"phoneNumber":"010"}'), {
  traineeId: 1,
  phoneNumber: '010',
});

// 종이 QR 토큰(숫자만 있어도 JSON 숫자로 읽지 않는다)
assert.deepEqual(parseQrScanValue('Ab3_-xYz0123456789AbCd'), {
  token: 'Ab3_-xYz0123456789AbCd',
});
assert.deepEqual(parseQrScanValue('1234567890123456789012'), {
  token: '1234567890123456789012',
});

assert.equal(parseQrScanValue('{"participantId":'), null);
assert.equal(parseQrScanValue('[1,2]'), null);
assert.equal(parseQrScanValue('short-token'), null);
assert.equal(parseQrScanValue('Ab3_-xYz0123456789AbCd!'), null);

console.log('parseQrScanValue ok');
