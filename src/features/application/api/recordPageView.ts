import clientInstance from '@/shared/libs/http/clientInstance';

// 신청화면 진입 기록(공개, 204). 응답을 기다리거나 실패를 알릴 필요가 없다
export const recordPageView = (expoId: string, visitorId: string) =>
  clientInstance
    .post(`/application/expos/${encodeURIComponent(expoId)}/page-views`, {
      visitorId,
    })
    .catch(() => undefined);
