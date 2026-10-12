import axios from 'axios';

// 스캔 API는 오류를 { status, message }로 돌려주지만 Next 프록시가 { error, status }로 바꿔 전달한다
// (토큰 재발급 뒤 재시도 응답만 원본 그대로). 둘 다 읽어 서버 문구가 있으면 보여 주고,
// 없을 때만 대체 문구를 쓴다. 409·503은 신청 취소 처리와 겹쳐 잠시 막히는 경우라 재시도를 안내한다.
const RETRYABLE_STATUSES = [409, 503];

export const getScanErrorMessage = (error: unknown, fallback: string) => {
  if (!axios.isAxiosError(error) || !error.response) return fallback;

  const { status, data } = error.response;
  const text = [data?.error, data?.message].find(
    (value): value is string => typeof value === 'string' && value !== '',
  );
  const message = text ?? null;
  if (!message) return fallback;

  return RETRYABLE_STATUSES.includes(status)
    ? `${message} 잠시 후 다시 스캔해 주세요.`
    : message;
};
