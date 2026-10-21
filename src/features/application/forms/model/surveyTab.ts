import { usePublicSurveyQuery } from '@/entities/survey';
import { getErrorStatus } from '@/shared/libs/http/apiError';
import { useNow } from './useNow';
import { useParticipantExpoDetail } from './useParticipantExpoDetail';

const DAY_MS = 24 * 60 * 60 * 1000;

const toKstDayStart = (day: string) =>
  new Date(`${day.slice(0, 10)}T00:00:00+09:00`).getTime();

/** 만족도 조사 탭이 보이는 구간. 시작일 00:00(KST) 이상, 종료일 다음 날 00:00(KST) 미만이다 */
export const getSurveyWindow = (startedDay: string, finishedDay: string) => ({
  openAt: toKstDayStart(startedDay),
  closeAt: toKstDayStart(finishedDay) + DAY_MS,
});

export const isSurveyTabPeriod = (
  startedDay: string,
  finishedDay: string,
  now: number,
) => {
  const { openAt, closeAt } = getSurveyWindow(startedDay, finishedDay);
  return now >= openAt && now < closeAt;
};

/**
 * 만족도 조사 탭 노출 상태. 행사 기간이고 공통 공개 설문이 있을 때만 `visible` 이다.
 * 설문 없음(404)은 숨기고, 그 밖의 조회 실패(isError)는 정상 공개로 단정하지 않고 호출부가 오류·재시도를 보여 준다
 */
export const useSurveyTab = (expoId: string) => {
  const { data: expo } = useParticipantExpoDetail(expoId);
  const { openAt, closeAt } = expo
    ? getSurveyWindow(expo.startedDay, expo.finishedDay)
    : { openAt: NaN, closeAt: NaN };
  const now = useNow([openAt, closeAt]);
  const inPeriod = !!expo && now >= openAt && now < closeAt;

  const survey = usePublicSurveyQuery(expoId, { enabled: inPeriod });
  const notFound = getErrorStatus(survey.error) === 404;

  return {
    isLoading: inPeriod && survey.isLoading,
    isError: inPeriod && survey.isError && !notFound,
    refetch: survey.refetch,
    visible: inPeriod && (!!survey.data || (survey.isError && !notFound)),
    surveyTitle: survey.data?.title,
  };
};
