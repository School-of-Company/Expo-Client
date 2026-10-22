import type {
  FieldVisitOutcome,
  FieldVisitPartyParticipant,
} from '../api/fieldVisits';

/** 일행 대표자 포함 최대 인원. 서버(Expo-Application-Server#311)가 최종 판정한다 */
export const MAX_PARTY_SIZE = 5;

/**
 * 오늘 방문일 기준 상태.
 * - PRE_TODAY: 오늘 확정된 사전등록이 있다. 현장등록을 만들지 않고 기존 QR 로 입장한다
 * - FIELD_TODAY: 오늘 현장등록이 유효하다. 중복 생성하지 않는다
 * - LEGACY_UNKNOWN: 방문일 없는 예전 현장등록. 오늘 등록으로 표시하지 않고 오늘 등록을 추가할 수 있다
 * - AVAILABLE: 오늘 등록이 없어 기존 참가자를 선택해 추가할 수 있다
 */
export type FieldVisitState =
  | 'PRE_TODAY'
  | 'FIELD_TODAY'
  | 'LEGACY_UNKNOWN'
  | 'AVAILABLE';

export const getFieldVisitState = (
  participant: FieldVisitPartyParticipant,
): FieldVisitState => {
  if (participant.preregistered) return 'PRE_TODAY';
  if (participant.fieldVisit?.status === 'ACTIVE') return 'FIELD_TODAY';
  if (participant.legacyFieldDateUnknown) return 'LEGACY_UNKNOWN';
  return 'AVAILABLE';
};

export const FIELD_VISIT_STATE_LABEL: Record<FieldVisitState, string> = {
  PRE_TODAY: '오늘 사전등록이 있습니다',
  FIELD_TODAY: '이미 현장등록했습니다',
  LEGACY_UNKNOWN: '방문일을 알 수 없는 예전 현장등록이 있습니다',
  AVAILABLE: '오늘 등록 가능',
};

/** 오늘 등록을 추가할 수 있는 참가자(이미 오늘 등록이 있는 사람은 제외) */
export const isSelectable = (participant: FieldVisitPartyParticipant) =>
  getFieldVisitState(participant) === 'AVAILABLE' ||
  getFieldVisitState(participant) === 'LEGACY_UNKNOWN';

/**
 * 새 동행자를 더 받을 수 있는 인원. 같은 사람의 날짜 추가는 일행 인원을 늘리지 않으므로
 * 기존 일행 수만 센다. 최종 판정은 서버(PARTY_LIMIT_EXCEEDED)가 한다
 */
export const getRemainingNewSlots = (
  participants: Pick<FieldVisitPartyParticipant, 'participantId'>[],
) => Math.max(0, MAX_PARTY_SIZE - participants.length);

export const OUTCOME_LABEL: Record<FieldVisitOutcome, string> = {
  REGISTERED_FIELD: '오늘 현장등록을 추가했습니다',
  REUSED_FIELD: '이미 오늘 현장등록이 있어 기존 등록을 그대로 씁니다',
  REUSED_PRE: '오늘 사전등록이 있어 기존 QR 로 입장합니다',
};

/** 알 수 없는 결과 코드는 임의로 등록 완료로 표시하지 않는다 */
export const getOutcomeLabel = (outcome: string) =>
  OUTCOME_LABEL[outcome as FieldVisitOutcome] ??
  '처리 결과를 알 수 없습니다. 내 신청에서 확인해주세요';
