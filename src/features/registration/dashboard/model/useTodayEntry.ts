// check-in 공개 API(index)로 읽으면 QR 스캐너(zxing)까지 묶여 대시보드 번들이 커져 모델 경로로 읽는다
import {
  entrySummaryQueryKey,
  useEntrySummary,
} from '@/features/exhibition/check-in/model/useEntrySummary';

/** 대시보드 새로고침에서 함께 다시 읽을 키 */
export const todayEntryQueryKey = entrySummaryQueryKey;

/** 오늘 입장 처리 건수(등록 QR + 종이 QR + 간편입장). 실패·로딩이면 null */
export const useTodayEntered = (expoId: string) => {
  const { data } = useEntrySummary(expoId);
  return data?.totals.entered ?? null;
};
