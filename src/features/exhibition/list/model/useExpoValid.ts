import { useQuery } from '@tanstack/react-query';
import { ExpoValid } from '@/shared/types/admin/type';
import { getExpoValid } from '../api/getExpoValid';

/** 박람회 ID 로 생성 여부를 찾는다. 한 번 받은 응답을 모든 페이지에서 같이 쓴다 */
export const useExpoValid = () =>
  useQuery({
    queryKey: ['expoValid'],
    queryFn: getExpoValid,
    select: (list) =>
      new Map<string, ExpoValid>(list.map((item) => [item.expoId, item])),
    // 폼을 만들고 목록으로 돌아오면 바로 반영되도록 화면에 들어올 때마다 다시 받는다
    staleTime: 0,
    // 목록 보조 정보라 실패해도 토스트 없이 표시만 생략한다
    meta: { silent: true },
    retry: false,
  });
