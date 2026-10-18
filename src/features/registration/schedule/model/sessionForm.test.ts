import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  EMPTY_SESSION_FORM,
  SessionForm,
  toSessionDefinition,
  validateSessionForm,
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
