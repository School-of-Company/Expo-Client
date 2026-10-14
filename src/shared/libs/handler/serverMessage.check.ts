/**
 * 자체 점검: `node --experimental-strip-types src/shared/libs/handler/serverMessage.check.ts`
 */
import assert from 'node:assert/strict';
import { toServerCode, toServerMessage } from './serverMessage.ts';

// nestjs-zod 검증 오류: 서버가 쓴 규칙 문구를 꺼낸다
assert.equal(
  toServerMessage(400, {
    message: 'Validation failed',
    errors: [
      { code: 'too_small', message: 'Too small' },
      {
        code: 'custom',
        message: '신청 폼에는 이름 필드가 정확히 하나 있어야 합니다.',
      },
    ],
  }),
  '신청 폼에는 이름 필드가 정확히 하나 있어야 합니다.',
);
// 규칙 문구가 없으면 공통 안내
assert.equal(
  toServerMessage(400, {
    message: 'Validation failed',
    errors: [{ code: 'too_small', message: 'Too small' }],
  }),
  '입력값을 확인해주세요.',
);
assert.equal(
  toServerMessage(409, { code: 'FORM_ALREADY_EXISTS', message: '이미 있음' }),
  '이미 있음',
);
assert.equal(
  toServerCode({ code: 'FORM_ALREADY_EXISTS' }),
  'FORM_ALREADY_EXISTS',
);
assert.equal(toServerCode({ message: 'x' }), undefined);

console.log('serverMessage checks passed');
