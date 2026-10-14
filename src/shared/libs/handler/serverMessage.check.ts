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
// ProblemDetail 은 message 없이 detail 에 사유가 온다
assert.equal(
  toServerMessage(422, {
    type: 'about:blank',
    title: 'Unprocessable Entity',
    status: 422,
    detail: '카카오 채널이 준비되지 않았습니다.',
  }),
  '카카오 채널이 준비되지 않았습니다.',
);
// 영문 detail·Gateway 문구는 상태별 한국어 문구로 바꾼다
assert.equal(
  toServerMessage(503, {
    title: 'Service Unavailable',
    detail: 'Application source unavailable; retry the request',
  }),
  '서비스를 잠시 사용할 수 없습니다. 잠시 후 다시 시도해 주세요.',
);
assert.equal(
  toServerMessage(404, { message: 'Not Found' }),
  '요청한 정보를 찾을 수 없습니다.',
);
assert.equal(
  toServerMessage(504, { message: 'Gateway Timeout' }),
  '서버 응답이 늦어 요청을 마치지 못했습니다. 잠시 후 다시 시도해 주세요.',
);
assert.equal(
  toServerMessage(401, {
    statusCode: 401,
    message: 'Unauthorized',
    error: 'Unauthorized',
  }),
  '로그인이 필요합니다. 다시 로그인해 주세요.',
);
// Nest 본문: 한국어 message 를 영문 error 보다 먼저 쓴다
assert.equal(
  toServerMessage(400, {
    statusCode: 400,
    message: '이미 신청했습니다.',
    error: 'Bad Request',
  }),
  '이미 신청했습니다.',
);
// 429: Gateway 영문은 공통 안내, 서비스 한국어 문구는 그대로
assert.equal(
  toServerMessage(429, {
    message: 'ThrottlerException: Too Many Requests',
  }),
  '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
);
assert.equal(
  toServerMessage(429, { message: '인증번호는 1분 뒤 다시 받을 수 있습니다.' }),
  '인증번호는 1분 뒤 다시 받을 수 있습니다.',
);
// 프록시를 거친 { error, status } 도 읽는다
assert.equal(
  toServerMessage(409, { error: '이미 처리된 요청입니다.', status: 409 }),
  '이미 처리된 요청입니다.',
);
// 모르는 상태의 영문·빈 본문은 호출한 쪽 대체 문구를 쓰도록 비운다
assert.equal(toServerMessage(418, { message: "I'm a teapot" }), undefined);
assert.equal(toServerMessage(418, undefined), undefined);
assert.equal(
  toServerCode({ code: 'FORM_ALREADY_EXISTS' }),
  'FORM_ALREADY_EXISTS',
);
assert.equal(toServerCode({ message: 'x' }), undefined);

console.log('serverMessage checks passed');
