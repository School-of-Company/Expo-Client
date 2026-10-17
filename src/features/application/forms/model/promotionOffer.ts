import { ApiError } from '@/shared/libs/http/apiError';

// 409 는 재검증 실패로 대기가 유지되며 응답 기한 안에는 다시 시도할 수 있다. 서버가 주는 사유(code)별 안내
const CONFLICT_REASON_LABEL: Record<string, string> = {
  OFFER_EXPIRED: '응답 기한이 지났습니다. 대기가 종료되었는지 확인해주세요.',
  OFFER_NOT_OPEN:
    '아직 응답할 수 있는 상태가 아닙니다. 잠시 후 다시 시도해주세요.',
  CAPACITY_UNAVAILABLE:
    '자리를 확인하지 못했습니다. 대기는 유지되니 기한 안에 다시 시도해주세요.',
  APPLICATION_STATE_CHANGED: '신청 상태가 바뀌었습니다. 새로고침해주세요.',
};

const CONFLICT_FALLBACK =
  '지금은 처리할 수 없습니다. 대기는 유지되니 기한 안에 다시 시도해주세요.';

// 409 는 사유별 문구로, 그 밖의 오류(404·503 포함)는 API 가 만든 문구 그대로 쓴다
export const getOfferErrorMessage = (error: Error) =>
  error instanceof ApiError && error.status === 409
    ? ((error.code && CONFLICT_REASON_LABEL[error.code]) ?? CONFLICT_FALLBACK)
    : error.message;
