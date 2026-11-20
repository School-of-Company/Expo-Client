import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ExpoFeatureSettings,
  getExpoFeatureSettings,
  patchExpoFeatureSettings,
  UpdateExpoFeatureSettingsRequest,
} from '../api/expoFeatures';

export const expoFeatureQueryKey = (expoId: string) =>
  ['expoFeatures', expoId] as const;

/**
 * 기능 설정 조회. 다른 탭·관리자가 바꾼 값을 놓치지 않도록 화면으로 돌아올 때마다 다시 읽는다.
 * 오류는 화면이 직접 보여 주므로 전역 토스트를 끈다
 */
export const useExpoFeatureSettings = (expoId: string) =>
  useQuery<ExpoFeatureSettings, Error>({
    queryKey: expoFeatureQueryKey(expoId),
    queryFn: () => getExpoFeatureSettings(expoId),
    staleTime: 0,
    refetchOnWindowFocus: 'always',
    meta: { silent: true },
  });

export const useSaveExpoFeatureSettings = (expoId: string) => {
  const queryClient = useQueryClient();
  return useMutation<
    ExpoFeatureSettings,
    Error,
    UpdateExpoFeatureSettingsRequest
  >({
    mutationFn: (request) => patchExpoFeatureSettings(expoId, request),
    onSuccess: (saved) => {
      // 저장 응답을 새 기준으로 삼는다
      queryClient.setQueryData(expoFeatureQueryKey(expoId), saved);
      // 관리자 상세·참가자 공개 정보(['expoDetail', id, 'participant'])와 목록도 기능·인증 값을 싣는다
      queryClient.invalidateQueries({ queryKey: ['expoDetail', expoId] });
      queryClient.invalidateQueries({ queryKey: ['expoList'] });
    },
  });
};
