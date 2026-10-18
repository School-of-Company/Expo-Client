import { useExpoDetail } from '@/shared/queries';
import { useNow } from './useNow';

/** 현장 등록 폼의 공개 시각. 행사 시작일(KST 날짜) 00:00 이며 행사 시작 시간이 아니다 */
const getFieldOpenAt = (startedDay: string) =>
  new Date(`${startedDay.slice(0, 10)}T00:00:00+09:00`).getTime();

/**
 * 현장 등록 폼이 사용자에게 공개됐는지. 공개 뒤 실제 접수 가능 여부는 폼 기간과 서버가 판정한다.
 * 행사 정보를 못 받으면(isError) 공개로 단정하지 않고 released=false 로 두며, 호출부가 오류·재시도를 보여 준다
 */
export const useFieldRelease = (expoId: string) => {
  const { data, isLoading, isError, refetch } = useExpoDetail(expoId);
  const openAt = data ? getFieldOpenAt(data.startedDay) : NaN;
  const now = useNow([openAt]);
  return {
    isLoading,
    isError,
    refetch,
    released: !!data && !(now < openAt),
    openAt,
  };
};
