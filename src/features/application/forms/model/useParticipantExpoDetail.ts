import { useQuery } from '@tanstack/react-query';
import { getExpoDetail } from '@/shared/api';
import { ExpoDetail } from '@/shared/types/exhibition/detail/type';

/**
 * 참가자 화면의 박람회 정보. 관리자 전용 조회라 비로그인 참가자는 401 을 받는데,
 * 이때 /signin 으로 보내지 않고 오류로 돌려 호출부가 정보 없이 화면을 그리게 한다.
 * 공개 API(GET /expo/{expoId}/public) 배포 뒤 clientInstance 로 바꾼다 (#680 2단계)
 */
export const getParticipantExpoDetail = (id: string) =>
  getExpoDetail(id, { skipAuthRedirect: true });

export const useParticipantExpoDetail = (id: string) =>
  useQuery<ExpoDetail, Error>({
    // 관리자 조회(['expoDetail', id])와 캐시·오류 상태를 나눈다
    queryKey: ['expoDetail', id, 'participant'],
    queryFn: () => getParticipantExpoDetail(id),
    // 실패해도 랜딩은 정보 없이, 현장 등록은 자체 안내로 처리한다
    meta: { silent: true },
  });
