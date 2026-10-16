import { useQueries } from '@tanstack/react-query';
import { getProgramFormList, programFormKeys } from '@/entities/form';

/**
 * 박람회별 프로그램용 폼 개수. 회차 연결 여부와 상관없이 행사에 저장된 폼을 세므로
 * 여러 회차가 같은 폼을 써도 1개다. 조회 중이면 undefined, 실패하면 null 로 0개와 구분한다
 */
export const useProgramFormCounts = (expoIds: string[]) => {
  const results = useQueries({
    queries: expoIds.map((expoId) => ({
      queryKey: programFormKeys.list(expoId),
      queryFn: () => getProgramFormList(expoId),
      // 폼을 만들고 목록으로 돌아오면 바로 반영되도록 화면에 들어올 때마다 다시 받는다
      staleTime: 0,
      // 목록 보조 정보라 실패해도 토스트 없이 카드에만 알린다
      meta: { silent: true },
      retry: false,
    })),
  });

  return new Map<string, number | null | undefined>(
    expoIds.map((expoId, index) => {
      const { data, isError } = results[index];
      return [expoId, data ? data.length : isError ? null : undefined];
    }),
  );
};
