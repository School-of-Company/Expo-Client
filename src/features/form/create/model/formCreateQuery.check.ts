/**
 * 자체 점검: `node --experimental-strip-types src/features/form/create/model/formCreateQuery.check.ts`
 */
import assert from 'node:assert/strict';
import {
  getFormCreatePath,
  getPeriodError,
  parseFormCreateSelection,
  toCompleteSelection,
  toSelectionQuery,
} from './formCreateQuery.ts';

const parse = (query: string) =>
  parseFormCreateSelection(new URLSearchParams(query));

const START = '2026-11-03T00:00:00.000Z';
const END = '2026-11-10T09:00:00.000Z';

// 모르는 값은 고르지 않은 것으로 본다
assert.deepEqual(
  parse('mode=foo&type=ADMIN&applicationType=X&startDate=nope'),
  {
    mode: null,
    userType: null,
    applicationType: null,
    startDate: null,
    endDate: null,
  },
);

// 등록 유형은 소문자로 와도 받는다(예전 주소 호환)
assert.equal(parse('applicationType=field').applicationType, 'FIELD');

// 등록용 폼은 등록 유형과 올바른 기간이 있어야 넘어간다
const application = parse(
  `mode=application&type=STANDARD&applicationType=PRE&startDate=${START}&endDate=${END}`,
);
assert.deepEqual(toCompleteSelection(application), {
  mode: 'application',
  userType: 'STANDARD',
  applicationType: 'PRE',
  startDate: START,
  endDate: END,
});
assert.equal(
  toCompleteSelection({ ...application, applicationType: null }),
  null,
);
assert.equal(toCompleteSelection({ ...application, endDate: null }), null);
assert.equal(
  toCompleteSelection({ ...application, startDate: END, endDate: START }),
  null,
);
assert.equal(
  getPeriodError({ startDate: END, endDate: END }),
  '마감 일시는 시작 일시보다 늦어야 합니다.',
);
assert.equal(getPeriodError({ startDate: START, endDate: END }), null);

// 연수자도 현장등록 폼을 만들 수 있다(신청관리 폼 탭과 같은 조합)
assert.equal(
  toCompleteSelection({
    ...application,
    userType: 'TRAINEE',
    applicationType: 'FIELD',
  })?.applicationType,
  'FIELD',
);

// 만족도 조사는 대상만 고르면 되고, 기간 없이 사전등록으로 보낸다
assert.deepEqual(toCompleteSelection(parse('mode=survey&type=TRAINEE')), {
  mode: 'survey',
  userType: 'TRAINEE',
  applicationType: 'PRE',
  startDate: null,
  endDate: null,
});
assert.equal(toCompleteSelection(parse('mode=survey')), null);

// 프로그램 폼은 다른 화면이라 작성 화면으로 넘기지 않는다
assert.equal(toCompleteSelection(parse('mode=program&type=STANDARD')), null);

// 선택 화면 쿼리는 쓰이는 값만 남긴다
assert.equal(
  toSelectionQuery(
    parse(`mode=survey&type=STANDARD&applicationType=FIELD&startDate=${START}`),
  ),
  'mode=survey&type=STANDARD',
);
assert.equal(
  toSelectionQuery(parse('mode=program&type=STANDARD'), 'schedule'),
  'mode=program&returnTo=schedule',
);
// 작성 화면의 쿼리를 그대로 읽으면 같은 선택이 된다
const completed = toCompleteSelection(application);
assert.ok(completed);
const createPath = getFormCreatePath('12', completed, 'schedule');
assert.deepEqual(
  toCompleteSelection(parse(createPath.split('?')[1])),
  completed,
);
assert.ok(createPath.startsWith('/admin/form/create/12?'));
assert.ok(createPath.endsWith('&returnTo=schedule'));

// 만족도 조사 작성 주소에는 빈 기간을 붙이지 않는다
assert.equal(
  getFormCreatePath(
    '12',
    toCompleteSelection(parse('mode=survey&type=STANDARD'))!,
  ),
  '/admin/form/create/12?type=STANDARD&mode=survey&applicationType=PRE',
);

// 박람회 ID 는 인코딩한다
assert.ok(
  getFormCreatePath(
    '../x',
    toCompleteSelection(parse('mode=survey&type=STANDARD'))!,
  ).startsWith('/admin/form/create/..%2Fx?'),
);

console.log('formCreateQuery: ok');
