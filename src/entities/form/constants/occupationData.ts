/** 직업 선택지. 키는 Form 서비스 `Occupation` 값과 정확히 같아야 한다(서버가 키로 학생·교사를 알아본다). */
export const OCCUPATION_OPTIONS = [
  { key: 'ELEMENTARY_STUDENT', label: '초등학생' },
  { key: 'MIDDLE_SCHOOL_STUDENT', label: '중학생' },
  { key: 'HIGH_SCHOOL_STUDENT', label: '고등학생' },
  { key: 'SCHOOL_STAFF', label: '교직원' },
  { key: 'PRE_SERVICE_TEACHER', label: '예비교사' },
  { key: 'PARENT', label: '보호자/학부모' },
  { key: 'GENERAL', label: '일반인' },
  { key: 'TEACHER', label: '교사' },
] as const;

export type Occupation = (typeof OCCUPATION_OPTIONS)[number]['key'];

/** 소속 학교 필드를 보여 줄 직업. 학교에 다니는 학생과 학교에 소속된 교직원·교사다. */
export const SCHOOL_OCCUPATIONS: Occupation[] = [
  'ELEMENTARY_STUDENT',
  'MIDDLE_SCHOOL_STUDENT',
  'HIGH_SCHOOL_STUDENT',
  'SCHOOL_STAFF',
  'TEACHER',
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
