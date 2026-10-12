import axios from 'axios';
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
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.error || '문자 매시지 전송에 실패했습니다.',
      );
    }
    throw error;
  }
};
