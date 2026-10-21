import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  EMPTY_POLICY_FORM,
  EMPTY_PROGRAM_FORM,
  ProgramForm,
  toProgramRequest,
  validateProgramForm,
} from './policyForm';

const form = (place: string): ProgramForm => ({
  ...EMPTY_PROGRAM_FORM,
  title: '회차',
  startedAt: '2026-10-01T10:00',
  endedAt: '2026-10-01T11:00',
  place,
  hasPolicy: false,
});

test('장소를 비우면 빈 문자열을 보내 기존 장소를 지운다', () => {
  assert.equal(toProgramRequest(form('')).place, '');
  assert.equal(toProgramRequest(form('   ')).place, '');
});

test('장소 필드 전 초안도 빈 문자열을 보낸다', () => {
  const draft = { ...form(''), place: undefined } as unknown as ProgramForm;
  assert.equal(toProgramRequest(draft).place, '');
});

test('입력한 장소는 앞뒤 공백을 빼고 보낸다', () => {
  assert.equal(toProgramRequest(form(' A홀 ')).place, 'A홀');
});

const onsiteProblem = (
  onsiteStartedAt: string | null,
  onsiteEndedAt: string | null,
) =>
  validateProgramForm({
    ...EMPTY_PROGRAM_FORM,
    title: '회차',
    startedAt: '2026-11-01T10:00',
    endedAt: '2026-11-01T11:00',
    hasPolicy: true,
    policy: {
      ...EMPTY_POLICY_FORM,
      capacity: 10,
      preRegistrationCapacity: 10,
      applicationStartedAt: '2026-10-01T09:00',
      applicationEndedAt: '2026-10-20T09:00',
      cancelEndedAt: '2026-10-25T09:00',
      promotionEndedAt: '2026-10-30T00:00',
      allowedOccupations: ['STUDENT'] as never,
      formId: '01a1595c-8dd7-7998-86b0-f9af65ce3e2a',
      onsiteStartedAt,
      onsiteEndedAt,
    },
  });

test('현장 접수 시작만 또는 종료만 입력하면 저장을 막는다', () => {
  const message = '현장 접수 시작·종료를 함께 설정해주세요.';
  assert.equal(onsiteProblem('2026-11-01T09:00', null), message);
  assert.equal(onsiteProblem(null, '2026-11-01T18:00'), message);
});

test('현장 접수 시작·종료가 둘 다 있거나 둘 다 없으면 통과한다', () => {
  assert.equal(onsiteProblem('2026-11-01T09:00', '2026-11-01T18:00'), null);
  assert.equal(onsiteProblem(null, null), null);
});
