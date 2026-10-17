import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  EMPTY_PROGRAM_FORM,
  ProgramForm,
  toProgramRequest,
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
