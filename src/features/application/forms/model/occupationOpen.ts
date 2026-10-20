import { useNow } from './useNow';

/**
 * 유형별 오픈 시각(PRE 폼 `occupationOpenAt`, Form #164) 전에도 사전등록할 수 있는 직업.
 * Application `PreregisterSeatCategory.requireOpen`(#209)과 같은 기준이다
 */
export const EARLY_OPEN_OCCUPATIONS = ['TEACHER', 'PRE_SERVICE_TEACHER'];

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토'];

/** "10월 26일(월) 오전 8시 30분". 기기 시간대와 상관없이 KST 로 보인다 */
export const formatOccupationOpenAt = (openAt: number) => {
  const kst = new Date(openAt + KST_OFFSET_MS);
  const hour = kst.getUTCHours();
  const minute = kst.getUTCMinutes();
  return `${kst.getUTCMonth() + 1}월 ${kst.getUTCDate()}일(${WEEKDAY[kst.getUTCDay()]}) ${hour < 12 ? '오전' : '오후'} ${hour % 12 || 12}시${minute ? ` ${minute}분` : ''}`;
};

export interface OccupationLock {
  /** 지금 고를 수 있는 직업 키 */
  allowed: string[];
  /** 막힌 선택지 아래 안내 */
  notice: string;
  /** 오픈 시각(ms) */
  openAt: number;
}

/** 오픈 시각 전이면 제한을, 시각이 없거나(null) 지났으면 null(제한 없음)을 돌려준다 */
export const getOccupationLock = (
  occupationOpenAt: string | null | undefined,
  now: number,
): OccupationLock | null => {
  const openAt = occupationOpenAt ? new Date(occupationOpenAt).getTime() : NaN;
  if (!(now < openAt)) return null;
  return {
    allowed: EARLY_OPEN_OCCUPATIONS,
    notice: `교원·예비교사 외 유형은 ${formatOccupationOpenAt(openAt)}부터 신청 가능합니다.`,
    openAt,
  };
};

/** 켜둔 화면도 오픈 시각이 되면 새로고침 없이 풀린다 */
export const useOccupationLock = (
  occupationOpenAt: string | null | undefined,
) => {
  const openAt = occupationOpenAt ? new Date(occupationOpenAt).getTime() : NaN;
  const now = useNow(Number.isFinite(openAt) ? [openAt] : []);
  return getOccupationLock(occupationOpenAt, now);
};

/** 일행에 교원·예비교사와 그 외 유형이 섞였는가. 구분 정원 회차에서 한쪽 좌석만 모자라도 일행 전체가 거절된다 */
export const isMixedParty = (occupations: (string | undefined)[]) => {
  const known = occupations.filter(Boolean) as string[];
  const early = known.filter((key) => EARLY_OPEN_OCCUPATIONS.includes(key));
  return early.length > 0 && early.length < known.length;
};
