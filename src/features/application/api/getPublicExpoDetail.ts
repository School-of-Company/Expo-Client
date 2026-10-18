import { useQuery } from '@tanstack/react-query';
import { toApiError } from '@/shared/libs/http/apiError';
import clientInstance from '@/shared/libs/http/clientInstance';
import { ExpoDetail } from '@/shared/types/exhibition/detail/type';

export type PublicExpoDetail = Pick<
  ExpoDetail,
  | 'title'
  | 'description'
  | 'startedDay'
  | 'finishedDay'
  | 'location'
  | 'coverImage'
>;

/**
 * 참가자 랜딩용 박람회 공개 정보. 관리자 상세(GET /expo/{expoId})는 ADMIN 전용이라 로그인 없이 읽는 공개 경로를 쓴다.
 * 서버 계약이 확정되기 전의 가정이므로 경로·응답이 달라지면 이 함수와 타입만 고친다.
 */
export const getPublicExpoDetail = async (
  expoId: string,
): Promise<PublicExpoDetail> => {
  try {
    const response = await clientInstance.get(
      `/expo/${encodeURIComponent(expoId)}/public`,
    );
    return response.data;
  } catch (error) {
    throw toApiError(error, '박람회 정보를 불러오지 못했습니다');
  }
};

export const usePublicExpoDetail = (expoId: string) =>
  useQuery<PublicExpoDetail, Error>({
    queryKey: ['publicExpoDetail', expoId],
    queryFn: () => getPublicExpoDetail(expoId),
    retry: false,
  });
