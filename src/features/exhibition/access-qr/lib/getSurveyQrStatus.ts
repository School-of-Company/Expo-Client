import { getErrorStatus } from '@/shared/libs/http/apiError';

export type SurveyQrStatus = 'loading' | 'ready' | 'none' | 'error';

/** 만족도 조사 QR 을 띄워도 되는지. 설문이 없으면(404) 'none', 그 밖의 조회 실패는 'error' 다 */
export const getSurveyQrStatus = ({
  isPending,
  error,
}: {
  isPending: boolean;
  error: unknown;
}): SurveyQrStatus => {
  if (error) return getErrorStatus(error) === 404 ? 'none' : 'error';
  return isPending ? 'loading' : 'ready';
};
