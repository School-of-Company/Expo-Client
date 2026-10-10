import axios from 'axios';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
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
      throw new Error(
        error.response.data?.error || '종이 QR 발급에 실패했습니다.',
      );
    }
    throw error;
  }
};
