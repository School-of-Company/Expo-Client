import assert from 'node:assert/strict';
import { test } from 'node:test';
import { KakaoTemplate } from '../../common/api/groupMessageApi';
import { getMessageTemplates } from './messageTemplates';

const template: KakaoTemplate = {
  id: 't1',
  name: '행사 전날 안내',
  content:
    '[#{행사명}] 안내\n#{참가자}님, #{프로그램명}(#{회차}) #{장소명} · #{신청상태}',
  variableMapping: {
    name: '#{참가자}',
    programName: '#{프로그램명}',
    sessionName: '#{회차}',
    location: '#{장소명}',
    status: '#{신청상태}',
  },
  variables: ['name', 'programName', 'sessionName', 'location', 'status'],
};

test('행사명은 박람회 제목으로, 나머지 변수는 문자 변수로 바꾼다', () => {
  const [example] = getMessageTemplates([template], '2026 박람회');
  assert.equal(example.id, 't1');
  assert.equal(example.label, '행사 전날 안내');
  assert.equal(
    example.body,
    '[2026 박람회] 안내\n{이름}님, {프로그램}({일시}) {장소} · {상태}',
  );
});

test("제목이 '['로 시작하면 괄호를 겹치지 않고, 제목이 없으면 머리말에서 뺀다", () => {
  assert.match(
    getMessageTemplates([template], '[QA 전용] 박람회')[0].body,
    /^\[QA 전용\] 박람회 안내\n/,
  );
  assert.match(getMessageTemplates([template], ' ')[0].body, /^안내\n/);
});

test('승인 템플릿이 없으면 예시 문구도 없다', () => {
  assert.deepEqual(getMessageTemplates([], '2026 박람회'), []);
});

test('URL·신청내역은 문자 변수로, 고정 변수는 값으로 바꾼다', () => {
  const [example] = getMessageTemplates(
    [
      {
        ...template,
        content: '#{참가자}님 #{신청내역}\nQR #{URL}\n주차 #{주차장URL}',
        variableMapping: {
          name: '#{참가자}',
          applicationSummary: '#{신청내역}',
          applicationUrl: '#{URL}',
        },
        fixedVariables: { '#{주차장URL}': 'https://glink.kr/busy' },
      },
    ],
    '2026 박람회',
  );
  assert.equal(
    example.body,
    '{이름}님 {신청내역}\nQR {URL}\n주차 https://glink.kr/busy',
  );
});

test('fixedVariables 가 없는 기존 템플릿은 그대로 동작한다', () => {
  assert.equal(
    getMessageTemplates([template], '2026 박람회')[0].body,
    '[2026 박람회] 안내\n{이름}님, {프로그램}({일시}) {장소} · {상태}',
  );
});
