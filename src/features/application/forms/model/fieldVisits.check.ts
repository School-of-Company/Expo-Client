/**
 * 자체 점검: `JITI_ALIAS="{\"@\":\"$PWD/src\"}" npx jiti src/features/application/forms/model/fieldVisits.check.ts`
 */
import assert from 'node:assert/strict';
import {
  getFieldVisitState,
  getOutcomeLabel,
  getRemainingNewSlots,
  isSelectable,
} from './fieldVisits';
import type { FieldVisitPartyParticipant } from '../api/fieldVisits';

const person = (
  overrides: Partial<FieldVisitPartyParticipant> = {},
): FieldVisitPartyParticipant => ({
  participantId: 1,
  name: '홍길동',
  representative: false,
  preregistered: false,
  fieldVisit: null,
  legacyFieldDateUnknown: false,
  ...overrides,
});

const visit = (status: 'ACTIVE' | 'CANCELLED') => ({
  registrationId: 'r',
  participantId: 1,
  visitDate: '2099-10-31',
  generation: 1,
  status,
  registeredAt: '2099-10-31T00:00:00Z',
  cancelledAt: null,
  cancelledBy: null,
  cancellable: true,
  cancellationBlockedReason: '',
});

// 오늘 사전등록은 현장등록을 만들지 않는다
assert.equal(getFieldVisitState(person({ preregistered: true })), 'PRE_TODAY');
assert.equal(isSelectable(person({ preregistered: true })), false);

// 오늘 유효한 현장등록은 중복 생성하지 않는다
assert.equal(
  getFieldVisitState(person({ fieldVisit: visit('ACTIVE') })),
  'FIELD_TODAY',
);
assert.equal(isSelectable(person({ fieldVisit: visit('ACTIVE') })), false);

// 취소된 오늘 등록은 다시 등록할 수 있다
assert.equal(
  getFieldVisitState(person({ fieldVisit: visit('CANCELLED') })),
  'AVAILABLE',
);

// 다른 날짜만 등록: 선택해 오늘 등록 추가
assert.equal(getFieldVisitState(person()), 'AVAILABLE');
assert.equal(isSelectable(person()), true);

// 방문일 미상은 오늘 등록으로 보지 않고 추가는 가능
assert.equal(
  getFieldVisitState(person({ legacyFieldDateUnknown: true })),
  'LEGACY_UNKNOWN',
);
assert.equal(isSelectable(person({ legacyFieldDateUnknown: true })), true);

// 5명 일행은 새 동행자를 받을 수 없지만 기존 선택은 가능하다
const five = [1, 2, 3, 4, 5].map((participantId) => person({ participantId }));
assert.equal(getRemainingNewSlots(five), 0);
assert.equal(five.every(isSelectable), true);
assert.equal(getRemainingNewSlots(five.slice(0, 2)), 3);

// 알 수 없는 결과는 등록 완료로 표시하지 않는다
assert.match(getOutcomeLabel('SOMETHING_NEW'), /알 수 없습니다/);
assert.match(getOutcomeLabel('REGISTERED_FIELD'), /추가했습니다/);

console.log('fieldVisits.check ok');
