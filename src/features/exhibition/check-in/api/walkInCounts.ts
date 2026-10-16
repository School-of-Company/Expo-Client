import { toApiError } from '@/shared/libs/http/apiError';
import clientTokenInstance from '@/shared/libs/http/clientTokenInstance';
import {
  WalkInCategory,
  WalkInCounts,
} from '@/shared/types/exhibition/check-in/entry';
import { scannerNameConfig } from './scannerNameHeader';

// 참여 서비스 간편입장 카운터(관리자 전용, 박람회 ID 는 소문자 UUID). Gateway 경로는 /walk-in-counts 다
const walkInPath = (expoId: string) =>
  `/walk-in-counts/${encodeURIComponent(expoId)}`;

/** 오늘(Asia/Seoul) 구분별 간편입장 합계 */
export const getWalkInCounts = async (
  expoId: string,
): Promise<WalkInCounts> => {
  try {
    const response = await clientTokenInstance.get<WalkInCounts>(
      walkInPath(expoId),
    );
    return response.data;
  } catch (error) {
    throw toApiError(error, '간편입장 집계를 불러오지 못했습니다.');
  }
};

export interface RecordWalkInRequest {
  category: WalkInCategory;
  action: 'ADD' | 'UNDO';
  // 응답을 못 받아 다시 보내도 한 번만 세도록 누를 때마다 새로 만든다(영문·숫자·-·_, 최대 64자)
  requestId: string;
}

/**
 * 간편입장 +1 또는 잘못 누른 것 하나 취소. 응답은 오늘 구분별 합계다.
 * 진행 중이 아닌 박람회·합계 0 에서 취소하면 400 이다
 */
export const postWalkIn = async (
  expoId: string,
  data: RecordWalkInRequest,
  scannerName?: string,
): Promise<WalkInCounts> => {
  try {
    const response = await clientTokenInstance.post<WalkInCounts>(
      walkInPath(expoId),
      data,
      scannerNameConfig(scannerName),
    );
    return response.data;
  } catch (error) {
    throw toApiError(error, '간편입장을 기록하지 못했습니다.');
  }
};
