import axios from 'axios';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import { getScanErrorMessage } from '@/shared/libs/http/getScanErrorMessage';
import { PaperQrCategory } from '../model/constants';

// Expo-Attendance-Server QrTokenController. 모두 관리자 전용이다

/** 종이 QR 한 장. token 은 입장 권한이라 인쇄에만 쓰고 남기지 않는다 */
export interface PaperQrItem {
  category: PaperQrCategory;
  /** 구분별 연번(1부터) */
  serial: number;
  /** 종이에 인쇄하는 코드. 예: ADT-0001-K7 */
  code: string;
  token: string;
  /** 분실 등으로 사용을 중지했는지 */
  revoked: boolean;
}

export interface PaperQrCategorySummary {
  /** 예전 발급분은 운영에서 쓰지 않는 구분일 수 있다 */
  category: string;
  active: number;
  revoked: number;
}

const basePath = (expoId: string) => `/qr-tokens/${encodeURIComponent(expoId)}`;

const toError = (error: unknown, fallback: string) => {
  if (!axios.isAxiosError(error)) return error;
  // ROLE_ADMIN 이 아니면 403. 서버 문구보다 할 일을 바로 알린다
  if (error.response?.status === 403) {
    return new Error('관리자만 사용할 수 있습니다.');
  }
  return new Error(getScanErrorMessage(error, fallback));
};

/** 한 번에 1000장까지. 응답 items 는 연번 순서다 */
export const postQrTokens = async (
  expoId: string,
  count: number,
  category: PaperQrCategory,
): Promise<PaperQrItem[]> => {
  try {
    const response = await clientTokenInstance.post<{ items: PaperQrItem[] }>(
      basePath(expoId),
      { count, category },
    );
    return response.data.items;
  } catch (error) {
    throw toError(error, '종이 QR 발급에 실패했습니다.');
  }
};

/** 발급한 적 있는 구분별 사용 중·무효화 수 */
export const getQrTokenSummary = async (
  expoId: string,
): Promise<PaperQrCategorySummary[]> => {
  try {
    const response = await clientTokenInstance.get<{
      categories: PaperQrCategorySummary[];
    }>(`${basePath(expoId)}/summary`);
    return response.data.categories ?? [];
  } catch (error) {
    throw toError(error, '종이 QR 발급 현황을 불러오지 못했습니다.');
  }
};

/** 이미 발급한 QR 을 연번으로 다시 조회한다. count 는 최대 120 */
export const getQrTokens = async (
  expoId: string,
  params: { category: PaperQrCategory; fromSerial: number; count: number },
): Promise<PaperQrItem[]> => {
  try {
    const response = await clientTokenInstance.get<{ items: PaperQrItem[] }>(
      basePath(expoId),
      { params },
    );
    return response.data.items ?? [];
  } catch (error) {
    throw toError(error, '종이 QR 을 조회하지 못했습니다.');
  }
};

/** 인쇄된 코드로 사용 중지. 이미 중지한 코드도 성공이다 */
export const revokeQrToken = async (expoId: string, code: string) => {
  try {
    await clientTokenInstance.patch(`${basePath(expoId)}/revoke`, { code });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      throw new Error(
        '이 박람회에 그 코드의 QR 이 없습니다. 코드가 생기기 전에 발급한 QR 은 무효화할 수 없습니다.',
      );
    }
    throw toError(error, 'QR 을 사용 중지하지 못했습니다.');
  }
};
