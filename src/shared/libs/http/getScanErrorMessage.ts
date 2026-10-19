import axios from 'axios';
import {
  toServerMessage,
  toStatusMessage,
} from '@/shared/libs/handler/serverMessage';
import { ApiError } from '@/shared/libs/http/apiError';

// 스캔 API는 오류를 { status, message }로 돌려주지만 Next 프록시가 { error, status }로 바꿔 전달한다
// (토큰 재발급 뒤 재시도 응답만 원본 그대로). 둘 다 읽어 서버 문구가 있으면 보여 주고,
// 없을 때만 대체 문구를 쓴다. 409·503은 신청 취소 처리와 겹쳐 잠시 막히는 경우라 재시도를 안내한다.
const RETRYABLE_STATUSES = [409, 503];

export const NETWORK_ERROR_MESSAGE =
  '서버에 연결하지 못했습니다. 네트워크를 확인한 뒤 다시 시도해 주세요.';

export const getScanErrorMessage = (error: unknown, fallback: string) => {
  if (!axios.isAxiosError(error)) return fallback;
  // 응답이 없으면(네트워크 끊김·timeout) axios 원문 대신 할 일을 알린다
  if (!error.response) return NETWORK_ERROR_MESSAGE;

  const { status, data } = error.response;
  // 영문 문구(Gateway "Service Unavailable" 등)는 상태별 한국어 문구로 바뀐다
  const message = toServerMessage(status, data);
  if (!message) return fallback;
  if (!RETRYABLE_STATUSES.includes(status)) return message;

  // 상태별 공통 문구에는 이미 재시도 안내가 있어, 대체 문구에 스캔 재시도 안내를 붙인다
  const base = message === toStatusMessage(status) ? fallback : message;
  return `${base} 잠시 후 다시 스캔해 주세요.`;
};

/** 스캔 오류 문구에 응답 상태를 함께 담는다. 화면이 상태와 모드로 안내를 고를 수 있다 */
export const toScanError = (error: unknown, fallback: string) => {
  const message = getScanErrorMessage(error, fallback);
  const status = axios.isAxiosError(error) ? error.response?.status : undefined;
  return status ? new ApiError(message, status) : new Error(message);
};
