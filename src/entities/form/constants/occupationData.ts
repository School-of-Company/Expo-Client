/**
 * 직업 선택지. 화면에 보이는 순서이기도 하다. 키는 Form 서비스 `Occupation` 값과 정확히 같아야 한다(서버가 키로 학생·교사를 알아본다).
 * 교직원(SCHOOL_STAFF)은 새 신청에서 고를 수 없어 넣지 않는다. 예전 답변 표시는 `LEGACY_OCCUPATION_LABEL` 이 맡는다.
 */
export const OCCUPATION_OPTIONS = [
  { key: 'KINDERGARTEN_STUDENT', label: '미취학' },
  { key: 'ELEMENTARY_STUDENT', label: '초등학생' },
  { key: 'MIDDLE_SCHOOL_STUDENT', label: '중학생' },
  { key: 'HIGH_SCHOOL_STUDENT', label: '고등학생' },
  { key: 'TEACHER', label: '교원' },
  { key: 'PRE_SERVICE_TEACHER', label: '예비교사' },
  { key: 'PARENT', label: '학부모' },
  { key: 'GENERAL', label: '일반인' },
] as const;

export type Occupation = (typeof OCCUPATION_OPTIONS)[number]['key'];

/** 예전에 받은 답변에만 남아 있는 직업. 새 신청에서는 고르지 못하지만 답변을 볼 때는 계속 표시한다 */
export const LEGACY_OCCUPATION_LABEL: Record<string, string> = {
  SCHOOL_STAFF: '교직원',
};

/** 서버가 `jsonData` 키 순서를 바꿔 저장해도 `OCCUPATION_OPTIONS` 순서로 보이게 한다. 모르는 키는 뒤로 보낸다 */
export const occupationRank = (key: string) => {
  const rank = OCCUPATION_OPTIONS.findIndex((option) => option.key === key);
  return rank === -1 ? OCCUPATION_OPTIONS.length : rank;
};

/**
 * 소속 필드를 보여 줄 직업. 교사와 예비교사만 받는다(Form PR #91).
 * 소속은 명찰에 "소속 이름"으로 찍히는 값이라 학생에게는 받지 않는다.
 */
export const SCHOOL_OCCUPATIONS: Occupation[] = [
  'TEACHER',
  'PRE_SERVICE_TEACHER',
];

/** 지역 선택지. 키는 Form 서비스 `Region` 값이고, 서버가 선택지를 내려주지 않아 표시 이름은 클라이언트가 정한다. */
export const REGION_OPTIONS = [
  { key: 'GWANGJU', label: '광주' },
  { key: 'JEONNAM', label: '전남' },
  { key: 'OTHER', label: '그 외' },
] as const;

export type Region = (typeof REGION_OPTIONS)[number]['key'];

/** 대표자 한 명이 추가할 수 있는 동행자 수의 상한. 대표자 포함 최대 5명이다(Form `COMPANION_MAX_COUNT`). */
export const COMPANION_MAX_COUNT = 4;
