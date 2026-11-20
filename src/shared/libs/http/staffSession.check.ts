/**
 * 자체 점검: `node --experimental-strip-types src/shared/libs/http/staffSession.check.ts`
 * 세션은 프록시를 거쳐 브라우저에서만 돌아서, 토큰 해석과 다시 받을 시각만 본다
 */
import assert from 'node:assert/strict';
import { readStaffClaims, toRefreshAt } from './staffSessionClaims.ts';

const toBase64Url = (value: object) =>
  Buffer.from(JSON.stringify(value))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

const token = (payload: object) =>
  `${toBase64Url({ alg: 'RS256' })}.${toBase64Url(payload)}.sig`;

// expoId 와 exp 를 읽는다. 한글처럼 여러 바이트 글자가 있어도 깨지지 않는다
assert.deepEqual(
  readStaffClaims(
    token({
      sub: 'staff:x',
      expoId: 'a1b2',
      exp: 1_700_000_000,
      label: '정문',
    }),
  ),
  { expoId: 'a1b2', exp: 1_700_000_000 },
);
// exp 가 없으면 null
assert.deepEqual(readStaffClaims(token({ expoId: 'e1' })), {
  expoId: 'e1',
  exp: null,
});
// expoId 가 없거나 형식이 깨지면 null
assert.equal(readStaffClaims(token({ sub: 'staff:x' })), null);
assert.equal(readStaffClaims('not-a-jwt'), null);
assert.equal(readStaffClaims('a.%%%.c'), null);

// 끝나기 1분 전에 다시 받는다
const now = 1_000_000;
assert.equal(toRefreshAt(now / 1000 + 15 * 60, now), now + 14 * 60 * 1000);
// 이미 1분 안쪽이면 지금 바로 다시 받는다
assert.equal(toRefreshAt(now / 1000 + 30, now), now);
// exp 가 없으면 10분 뒤
assert.equal(toRefreshAt(null, now), now + 10 * 60 * 1000);

console.log('staffSession ok');
