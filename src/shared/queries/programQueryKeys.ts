import { QueryClient } from '@tanstack/react-query';

// 박람회 프로그램 목록을 읽는 쿼리 키. 같은 서버 목록(revision 포함)을 화면마다 따로 들고 있어
// 한쪽에서 바꾸면 다른 쪽도 새로 읽어야 오래된 revision 으로 저장(409)하거나 지운 프로그램이 되살아나지 않는다
export const programQueryKeys = {
  standard: (expoId: string) => ['standardProgram', expoId] as const,
  training: (expoId: string) => ['trainingProgram', expoId] as const,
  schedule: (expoId: string) => ['schedulePrograms', expoId] as const,
};

/** 박람회 수정·일정 화면·변경 재시도 뒤 프로그램 목록을 모두 다시 읽게 한다 */
export const invalidateExpoPrograms = (
  queryClient: QueryClient,
  expoId: string,
) =>
  Promise.all(
    Object.values(programQueryKeys).map((key) =>
      queryClient.invalidateQueries({ queryKey: key(expoId) }),
    ),
  );
