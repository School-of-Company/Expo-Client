import { toast } from 'react-toastify';

// TODO: 서버 연결 시 제거하고 @/shared/api 의 postSendSms / getCheckSmsCode 로 교체
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockSendSms = async (_phoneNumber: string) => {
  await delay(500);
};

// 형식 검증(6자리 숫자)을 통과한 인증 번호는 모두 성공 처리
export const mockCheckSmsCode = async (_phoneNumber: string, _code: string) => {
  await delay(500);
  toast.success('인증 번호 확인에 성공했습니다.');
  return true;
};
