// 종이 QR 구분. 운영은 어른/아이만 쓰고, 바쁘면 구분 없이 한 종류만 쓴다
export type PaperQrCategory = 'ADULT' | 'CHILD' | 'GENERAL';

export const PAPER_QR_CATEGORIES: {
  value: PaperQrCategory;
  label: string;
  // 라벨에 크게 찍는 글. 구분 없음은 찍지 않는다
  printLabel: string | null;
  // 입구에서 멀리서도 구분하도록 인쇄물 띠에 칠하는 색
  printColor: string;
}[] = [
  { value: 'ADULT', label: '성인', printLabel: '어른', printColor: '#448fff' },
  {
    value: 'CHILD',
    label: '어린이',
    printLabel: '아이',
    printColor: '#f08c00',
  },
  {
    value: 'GENERAL',
    label: '구분 없음',
    printLabel: null,
    printColor: '#383838',
  },
];

// 예전에 발급한 다른 구분(직업별)은 서버 구분 이름을 그대로 보인다
export const getCategoryLabel = (category: string) =>
  PAPER_QR_CATEGORIES.find((item) => item.value === category)?.label ??
  category;

// 예전에 발급한 다른 구분은 기본 색으로 찍는다
export const getCategoryPrintColor = (category: string) =>
  PAPER_QR_CATEGORIES.find((item) => item.value === category)?.printColor ??
  '#383838';

// 발급 API가 한 번에 받는 최대 장수
export const MAX_TOKENS_PER_REQUEST = 1000;

// 한 번에 발급할 합계 상한. 잘못 입력해 수만 장을 순차로 발급하지 않도록 막는다
export const MAX_TOKENS_PER_ISSUE = 5000;

// 라벨 크기(mm). 프린터와 라벨은 현장에서 확인해 바꾼다
export const DEFAULT_LABEL_SIZE = { width: 60, height: 40 };
