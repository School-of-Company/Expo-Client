/**
 * 자체 점검: `JITI_JSX=1 JITI_ALIAS="{\"@\":\"$PWD/src\"}" npx jiti src/features/phone-verification/lib/getRedirectPath.check.ts`
 */
import assert from 'node:assert/strict';
import { getRedirectPath } from './getRedirectPath';

Object.assign(globalThis, {
  window: { location: { origin: 'https://example.com' } },
});

// 번호를 주소에 싣지 않는다
assert.equal(
  getRedirectPath('/application/e1?formType=application'),
  '/application/e1?formType=application',
);
// 예전 링크에 남은 번호 쿼리는 지운다
assert.equal(
  getRedirectPath(
    '/application/forms/e1/pre-register?sessionId=61&phoneNumber=01012345678',
  ),
  '/application/forms/e1/pre-register?sessionId=61',
);
// 외부 주소는 막는다
assert.equal(getRedirectPath('//evil.com'), '/');
console.log('ok');
