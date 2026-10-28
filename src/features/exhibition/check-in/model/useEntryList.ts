import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getEntryList } from '../api/getEntryList';

// 다른 입구에서 처리한 입장도 보이도록 집계와 같은 주기로 다시 읽는다
const ENTRY_LIST_REFRESH_MS = 30 * 1000;

export const entryListQueryKey = (expoId: string) =>
  ['entryList', expoId] as const;

/** 오늘 입장한 등록 QR 참가자 표. 서버 기록이라 화면을 나갔다 들어와도, 다른 기기에서 열어도 같다 */
export const useEntryList = (expoId: string) =>
  useQuery({
    queryKey: entryListQueryKey(expoId),
    queryFn: () => getEntryList(expoId),
    refetchInterval: ENTRY_LIST_REFRESH_MS,
    // 실패해도 이전 표를 그대로 두고 표 위에만 알린다. 스캔마다 토스트가 쌓이지 않게 한다
    meta: { silent: true },
  });

/** 입장을 처리한 뒤 표를 바로 다시 읽게 한다 */
export const useInvalidateEntryList = (expoId: string) => {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: entryListQueryKey(expoId) });
};
