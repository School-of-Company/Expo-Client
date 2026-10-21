/**
 * 자체 점검: `JITI_JSX=1 JITI_ALIAS="{\"@\":\"$PWD/src\"}" npx jiti src/features/phone-verification/lib/getRedirectPath.check.ts`
 */
import assert from 'node:assert/strict';
import { getRedirectPath } from './getRedirectPath';

Object.assign(globalThis, {
  window: { location: { origin: 'https://example.com' } },
});

// 신청 폼은 번호 쿼리를 읽는다
assert.equal(
  getRedirectPath('/application/e1?formType=application', '01012345678'),
  '/application/e1?formType=application&phoneNumber=01012345678',
);
// 설문 주소에는 번호를 싣지 않는다
assert.equal(
  getRedirectPath(
    '/application/e1?formType=survey&userType=STANDARD',
    '01012345678',
  ),
  '/application/e1?formType=survey&userType=STANDARD',
);
// 외부 주소는 막는다
assert.equal(
  getRedirectPath('//evil.com', '01012345678'),
  '/?phoneNumber=01012345678',
);
console.log('ok');
