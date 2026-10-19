import { ApiError } from '@/shared/libs/http/apiError';

// 대기가 이미 끝났거나 대상이 사라져 다시 시도해도 소용없는 사유
const ENDED_REASON_LABEL: Record<string, string> = {
  OFFER_EXPIRED: '응답 기한이 지나 대기가 종료되었습니다.',
  OFFER_DECLINED: '이미 거절한 제안입니다.',
  OFFER_ENDED: '이 제안은 종료되었습니다.',
  OFFER_ACCEPTED: '이미 수락한 제안입니다. 신청 현황에서 확인해주세요.',
  PROMOTION_ENDED: '신청 기간이 끝나 더 이상 수락할 수 없습니다.',
  PROGRAM_DELETED: '프로그램이 삭제되어 수락할 수 없습니다.',
  OFFER_TARGET_CHANGED: '신청 상태가 바뀌었습니다. 새로고침해주세요.',
};

// 수락 때 다시 확인한 조건이 맞지 않은 경우. 대기는 응답 기한까지 유지된다
const CONFLICT_REASON_LABEL: Record<string, string> = {
  OFFER_NOT_RESPONDABLE:
    '아직 응답할 수 있는 상태가 아닙니다. 잠시 후 다시 시도해주세요.',
  TIME_CONFLICT: '이미 신청한 일정과 시간이 겹쳐 수락할 수 없습니다.',
  GROUP_ALREADY_APPLIED: '같은 그룹의 프로그램에 이미 신청되어 있습니다.',
  PREREGISTRATION_NOT_CONFIRMED: '사전등록이 확정되지 않아 수락할 수 없습니다.',
  SESSION_TIME_MISMATCH:
    '사전등록한 회차 시간과 맞지 않는 프로그램이라 수락할 수 없습니다.',
  CAPACITY_CHANGED:
    '자리가 바뀌어 수락하지 못했습니다. 대기는 유지되니 기한 안에 다시 시도해주세요.',
  TRAINEE_UNAVAILABLE: '참가자 정보를 확인하지 못해 수락할 수 없습니다.',
};

const CONFLICT_FALLBACK =
  '지금은 처리할 수 없습니다. 새로고침 후 다시 시도해주세요.';

// 409 는 사유별 문구로, 그 밖의 오류(404·503 포함)는 API 가 만든 문구 그대로 쓴다
export const getOfferErrorMessage = (error: Error) => {
  if (!(error instanceof ApiError) || error.status !== 409)
    return error.message;
  const code = error.code ?? '';
  return (
    ENDED_REASON_LABEL[code] ?? CONFLICT_REASON_LABEL[code] ?? CONFLICT_FALLBACK
  );
};
