import { useQuery } from '@tanstack/react-query';
import { toApiError } from '@/shared/libs/http/apiError';
import clientInstance from '@/shared/libs/http/clientInstance';
import { ExpoDetail } from '@/shared/types/exhibition/detail/type';

/** 공개 조회 응답에서 참가자 화면이 쓰는 필드(Expo-Expo-Server#155 계약) */
export type PublicExpoDetail = Pick<
  ExpoDetail,
  'title' | 'description' | 'location' | 'startedDay' | 'finishedDay'
>;

/**
 * 참가자 화면의 박람회 정보. 로그인 없이 부를 수 있는 공개 API 라 관리자 토큰을 쓰지 않는다.
 * 관리자 화면의 `useExpoDetail` 과 캐시를 나눈다
 */
export const getParticipantExpoDetail = async (
  id: string,
): Promise<PublicExpoDetail> => {
  try {
    const { data } = await clientInstance.get<PublicExpoDetail>(
      `/expo/${encodeURIComponent(id)}/public`,
    );
    const { title, description, location, startedDay, finishedDay } = data;
    return { title, description, location, startedDay, finishedDay };
  } catch (error) {
    throw toApiError(error, '박람회 정보 불러오기 실패');
  }
};

export const useParticipantExpoDetail = (id: string) =>
  useQuery<PublicExpoDetail, Error>({
    queryKey: ['expoDetail', id, 'participant'],
    queryFn: () => getParticipantExpoDetail(id),
    // 실패해도 랜딩은 정보 없이, 현장 등록은 자체 안내로 처리한다
    meta: { silent: true },
  });
