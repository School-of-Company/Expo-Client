import axios from 'axios';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import { getScanErrorMessage } from '@/shared/libs/http/getScanErrorMessage';
import { PaperQrCategory } from '../model/constants';

// 토큰은 입장 권한이고 재조회 API가 없다. 응답은 인쇄에만 쓰고 남기지 않는다
export const postQrTokens = async (
  expoId: string,
  count: number,
  category: PaperQrCategory,
): Promise<string[]> => {
  try {
    const response = await clientTokenInstance.post<{ tokens: string[] }>(
      `/qr-tokens/${expoId}`,
      { count, category },
    );
    return response.data.tokens;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // ROLE_ADMIN이 아니면 403. 서버 문구보다 할 일을 바로 알린다
      if (error.response.status === 403) {
        throw new Error('관리자만 발급할 수 있습니다.');
      }
      throw new Error(
        getScanErrorMessage(error, '종이 QR 발급에 실패했습니다.'),
      );
    }
    throw error;
  }
};
