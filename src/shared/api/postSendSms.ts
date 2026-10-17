import { toApiError } from '@/shared/libs/http/apiError';
import clientInstance from '@/shared/libs/http/clientInstance';

// 박람회 화면에서 요청하면 expoId 를 보내 인증 문구의 #{행사명}을 그 박람회 제목으로 채운다.
// 박람회와 관계없는 화면(관리자 가입 등)은 phoneNumber 만 보내고 서버가 기본 행사명을 쓴다
export const postSendSms = async (phoneNumber: string, expoId?: string) => {
  // 빈 번호는 요청하지 않고 실패로 처리한다
  if (!phoneNumber) {
    throw new Error('전화번호를 입력해주세요.');
  }

  try {
    const response = await clientInstance.post(
      '/sms',
      expoId ? { phoneNumber, expoId } : { phoneNumber },
    );
    return response;
  } catch (error) {
    // 서버 문구가 문자열이 아니면 기본 문구를 쓴다
    throw toApiError(error, '문자 메시지 전송에 실패했습니다.');
  }
};
