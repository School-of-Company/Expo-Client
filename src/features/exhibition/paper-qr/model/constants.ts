// 종이 QR 구분. 운영은 어른/아이만 쓰고, 바쁘면 구분 없이 한 종류만 쓴다
export type PaperQrCategory = 'ADULT' | 'CHILD' | 'GENERAL';

export const PAPER_QR_CATEGORIES: {
  value: PaperQrCategory;
  label: string;
  // 라벨에 크게 찍는 글. 구분 없음은 찍지 않는다
  printLabel: string | null;
}[] = [
  { value: 'ADULT', label: '성인', printLabel: '어른' },
  { value: 'CHILD', label: '어린이', printLabel: '아이' },
  { value: 'GENERAL', label: '구분 없음', printLabel: null },
];

export const getCategoryLabel = (category: PaperQrCategory) =>
  PAPER_QR_CATEGORIES.find((item) => item.value === category)?.label ??
  '구분 없음';

// 발급 API가 한 번에 받는 최대 장수
export const MAX_TOKENS_PER_REQUEST = 1000;

// 한 번에 발급할 합계 상한. 잘못 입력해 수만 장을 순차로 발급하지 않도록 막는다
export const MAX_TOKENS_PER_ISSUE = 5000;

// 라벨 크기(mm). 프린터와 라벨은 현장에서 확인해 바꾼다
export const DEFAULT_LABEL_SIZE = { width: 60, height: 40 };
