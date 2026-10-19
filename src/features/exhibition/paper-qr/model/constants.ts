// 종이 QR 발급 구분. 운영은 성인/학생(성인 외 모두) 두 가지만 쓴다. 서버는 CHILD 값을 학생으로 쓴다
export type PaperQrCategory = 'ADULT' | 'CHILD';

export const PAPER_QR_CATEGORIES: {
  value: PaperQrCategory;
  label: string;
  // 라벨에 크게 찍는 글. 구분 없음은 찍지 않는다
  printLabel: string | null;
}[] = [
  { value: 'ADULT', label: '성인', printLabel: '성인' },
  { value: 'CHILD', label: '학생', printLabel: '학생' },
];

// 예전에 발급한 구분 없음(GENERAL)은 표시만 유지하고, 그 밖의 구분(직업별)은 서버 구분 이름을 그대로 보인다
export const getCategoryLabel = (category: string) =>
  PAPER_QR_CATEGORIES.find((item) => item.value === category)?.label ??
  (category === 'GENERAL' ? '구분 없음' : category);

// 발급 API가 한 번에 받는 최대 장수
export const MAX_TOKENS_PER_REQUEST = 1000;

// 한 번에 발급할 합계 상한. 잘못 입력해 수만 장을 순차로 발급하지 않도록 막는다
export const MAX_TOKENS_PER_ISSUE = 5000;

// 라벨 크기(mm). 프린터와 라벨은 현장에서 확인해 바꾼다
export const DEFAULT_LABEL_SIZE = { width: 60, height: 40 };
