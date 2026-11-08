/**
 * 자체 점검: `node --experimental-strip-types src/views/entry-qr/lib/parseEntryQrQuery.check.ts`
 */
import assert from 'node:assert/strict';
import { maskPhoneNumber, parseEntryQrQuery } from './parseEntryQrQuery.ts';

const CODE = 'Ab3_-xYz0123456789AbCd';

// 표기는 등록 유형, 페이로드는 문구 변경 전과 같은 문자열이어야 한다(기존 입구 스캐너 호환)
const standard = parseEntryQrQuery({
  expoId: '1',
  type: 'STANDARD',
  id: '42',
  code: CODE,
});
assert.deepEqual(standard, {
  value: `{"participantId":42,"code":"${CODE}"}`,
  typeLabel: '사전등록 참가자',
});

const trainee = parseEntryQrQuery({
  expoId: '1',
  type: 'trainee',
  id: '7',
  phoneNumber: '010-1234-5678',
});
assert.deepEqual(trainee, {
  value: '{"traineeId":7,"phoneNumber":"01012345678"}',
  typeLabel: '교원 연수자',
  phoneNumber: '01012345678',
});
assert.equal(maskPhoneNumber(trainee!.phoneNumber!), '010-****-5678');

// 잘못된 링크는 지금처럼 null
for (const query of [
  { type: 'STANDARD', id: '42', code: CODE },
  { expoId: '1', type: 'STANDARD', id: '0', code: CODE },
  { expoId: '1', type: 'STANDARD', id: '42', code: 'short' },
  { expoId: '1', type: 'STANDARD', id: '42', code: `${CODE.slice(1)}!` },
  { expoId: '1', type: 'TRAINEE', id: '7', phoneNumber: '02-123-4567' },
  { expoId: '1', type: 'OTHER', id: '7' },
]) {
  assert.equal(parseEntryQrQuery(query), null, JSON.stringify(query));
}

console.log('parseEntryQrQuery ok');
