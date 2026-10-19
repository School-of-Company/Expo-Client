import { WalkInCategory } from '@/shared/types/exhibition/check-in/entry';

// 간편입장 참가 유형 8종(Expo-Attendance-Server#149). 버튼은 이 순서대로 놓는다
export const WALK_IN_CATEGORIES: {
  value: WalkInCategory;
  label: string;
}[] = [
  { value: 'KINDERGARTEN_STUDENT', label: '미취학 아동' },
  { value: 'ELEMENTARY_STUDENT', label: '초등학생' },
  { value: 'MIDDLE_SCHOOL_STUDENT', label: '중학생' },
  { value: 'HIGH_SCHOOL_STUDENT', label: '고등학생' },
  { value: 'PARENT', label: '학부모' },
  { value: 'GENERAL', label: '일반인' },
  { value: 'TEACHER', label: '교사' },
  { value: 'PRE_SERVICE_TEACHER', label: '예비교사' },
];

// 새 화면은 8종만 쓰지만, 예전에 쌓인 기록과 서버 응답에는 아래 두 값이 남아 있다
export const LEGACY_WALK_IN_CATEGORY_LABEL: Record<string, string> = {
  ADULT: '성인',
  STUDENT: '어린이·학생',
};

export const WALK_IN_CATEGORY_LABEL: Record<string, string> = {
  ...Object.fromEntries(WALK_IN_CATEGORIES.map((c) => [c.value, c.label])),
  ...LEGACY_WALK_IN_CATEGORY_LABEL,
};
