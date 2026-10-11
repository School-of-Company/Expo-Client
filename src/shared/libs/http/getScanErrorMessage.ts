import axios from 'axios';

// 이 서버의 스캔 API는 오류를 { status, message }로 돌려준다. 서버 문구가 있으면 그대로 보여 주고,
// 없을 때만 대체 문구를 쓴다. 409는 신청 취소가 처리되는 동안만 막히므로 재시도를 안내한다.
export const getScanErrorMessage = (error: unknown, fallback: string) => {
  if (!axios.isAxiosError(error) || !error.response) return fallback;

  const { status, data } = error.response;
  const message =
    typeof data?.message === 'string' && data.message ? data.message : null;
  if (!message) return fallback;

  return status === 409 ? `${message} 잠시 후 다시 스캔해 주세요.` : message;
};
