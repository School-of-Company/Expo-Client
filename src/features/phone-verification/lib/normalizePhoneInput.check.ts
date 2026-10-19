/**
 * 자체 점검: `npx jiti src/features/phone-verification/lib/normalizePhoneInput.check.ts`
 */
import assert from 'node:assert/strict';
import { normalizePhoneInput } from './normalizePhoneInput';

assert.equal(normalizePhoneInput('010-1234-5678'), '01012345678');
assert.equal(normalizePhoneInput(' 010 1234 5678 '), '01012345678');
assert.equal(normalizePhoneInput('010.123.4567'), '0101234567');
assert.equal(normalizePhoneInput('+82 10-1234-5678'), '01012345678');
assert.equal(normalizePhoneInput('+82 010-1234-5678'), '01012345678');
assert.equal(normalizePhoneInput('+821012345678'), '01012345678');
assert.equal(normalizePhoneInput('0082-10-1234-5678'), '01012345678');
// 직접 입력하는 중간 값은 바꾸지 않는다
assert.equal(normalizePhoneInput('0'), '0');
assert.equal(normalizePhoneInput('+8'), '8');
assert.equal(normalizePhoneInput('+82'), '');
assert.equal(normalizePhoneInput('0101234'), '0101234');
// 11자리를 넘으면 자른다
assert.equal(normalizePhoneInput('010123456789'), '01012345678');
assert.equal(normalizePhoneInput('abc'), '');

console.log('normalizePhoneInput.check: ok');
