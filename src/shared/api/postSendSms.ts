import { toApiError } from '@/shared/libs/http/apiError';
import clientInstance from '@/shared/libs/http/clientInstance';

export const postSendSms = async (phoneNumber: string) => {
  // 빈 번호는 요청하지 않고 실패로 처리한다
  if (!phoneNumber) {
    throw new Error('전화번호를 입력해주세요.');
  }

  try {
    const response = await clientInstance.post('/sms', { phoneNumber });
    return response;
  } catch (error) {
    // 서버 문구가 문자열이 아니면 기본 문구를 쓴다
    throw toApiError(error, '문자 메시지 전송에 실패했습니다.');
  }
};
