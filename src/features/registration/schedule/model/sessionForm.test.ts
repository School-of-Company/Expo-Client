import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  EMPTY_SESSION_FORM,
  SessionForm,
  toSessionDefinition,
  validateSessionForm,
  validateShortenedEnd,
} from './sessionForm';

const form = (patch: Partial<SessionForm>): SessionForm => ({
  ...EMPTY_SESSION_FORM,
  title: '회차',
  place: '장소',
  startedAt: '2026-10-31T10:00',
  endedAt: '2026-10-31T12:00',
  ...patch,
});

test('구분별 정원을 입력하면 총정원은 두 값의 합으로 보낸다', () => {
  const body = toSessionDefinition(
    form({ teacherCapacity: 5, nonTeacherCapacity: 20 }),
  );
  assert.equal(body.capacity, 25);
  assert.equal(body.teacherCapacity, 5);
  assert.equal(body.nonTeacherCapacity, 20);
});

test('구분별 정원을 비우면 기존처럼 총정원만 보낸다', () => {
  const body = toSessionDefinition(form({ capacity: 7 }));
  assert.equal(body.capacity, 7);
  assert.equal('teacherCapacity' in body, false);
});

test('구분별 정원은 함께 입력해야 하고 합계가 1 이상이어야 한다', () => {
  assert.ok(validateSessionForm(form({ teacherCapacity: 5 })));
  assert.ok(
    validateSessionForm(form({ teacherCapacity: 0, nonTeacherCapacity: 0 })),
  );
  assert.equal(
    validateSessionForm(form({ teacherCapacity: 0, nonTeacherCapacity: 3 })),
    null,
  );
});

// 서버 값은 오프셋 시각이라 실행 환경 시간대와 무관하게 로컬 17:00 이 되도록 만든다
const sessionOf = (endedAt: string) =>
  ({
    endedAt: new Date(endedAt).toISOString(),
  }) as Parameters<typeof validateShortenedEnd>[0];

test('신청 이력이 있는 회차는 같은 날짜 안의 종료 단축만 허용한다', () => {
  const session = sessionOf('2026-10-31T17:00');
  const edit = (endedAt: string) =>
    validateShortenedEnd(session, form({ endedAt }));
  assert.equal(edit('2026-10-31T16:30'), null);
  assert.equal(edit('2026-10-31T17:00'), null);
  assert.ok(edit('2026-10-31T17:30'));
  assert.ok(edit('2026-11-01T16:30'));
});

test('종료 단축 기준은 편집 중인 값이 아니라 서버의 원래 종료다', () => {
  const session = sessionOf('2026-10-31T17:00');
  // 이미 16:30 으로 고친 값을 다시 16:45 로 늘려도 원래(17:00) 안이면 단축이다
  assert.equal(
    validateShortenedEnd(session, form({ endedAt: '2026-10-31T16:45' })),
    null,
  );
});
