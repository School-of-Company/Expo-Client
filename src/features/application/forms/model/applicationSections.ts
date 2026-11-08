import type { Program } from '@/shared/types/program/list/type';

/**
 * 신청 목록의 프로그램·연수 카드 묶음.
 * 제목에서 회차 표기("N회차", "(N회차)")를 뺀 이름이 같은 회차끼리 한 카드로 묶는다.
 * 서버 groupId 는 "같은 묶음 중 하나만 신청" 규칙이라 표시 분류로 쓰지 않는다.
 * ponytail: 제목 기준 묶기는 임시다. 서버에 "프로그램 > 회차" 상위 단위가 생기면 그것으로 바꾼다
 */
export interface CategoryGroup {
  /** 주소의 `?category=` 값. 회차 표기를 뺀 이름 */
  key: string;
  label: string;
  sessions: Program[];
}

const ROUND = /\(\s*\d+\s*회차\s*\)|\d+\s*회차/g;

/** 회차 표기를 뺀 이름. "투어(2회차)" → "투어", "연수 2회차 · 주제" → "연수 · 주제" */
export const getSeriesName = (title: string) => {
  const name = title
    .replace(ROUND, ' ')
    .replace(/\s+/g, ' ')
    // "(삼성 1회차) 주제" → "(삼성) 주제"
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .replace(/\(\)/g, '')
    // 회차 표기를 빼고 남은 앞뒤 구분 기호("· 주제", "투어 -")를 걷는다
    .replace(/^[\s·:\-–—|]+|[\s·:\-–—|]+$/g, '')
    .trim();
  // 제목이 회차 표기뿐이면 원래 제목을 쓴다
  return name || title.trim();
};

const byStart = (a: Program, b: Program) =>
  a.startedAt.localeCompare(b.startedAt) || a.id - b.id;

/** 회차를 이름별 카드로 묶는다. 카드와 카드 안 회차는 시작 시각 순이다 */
export const groupBySeries = (programs: Program[]): CategoryGroup[] => {
  const groups = new Map<string, CategoryGroup>();
  [...programs].sort(byStart).forEach((program) => {
    const key = getSeriesName(program.title);
    const group = groups.get(key);
    if (group) group.sessions.push(program);
    else groups.set(key, { key, label: key, sessions: [program] });
  });
  return Array.from(groups.values());
};

/**
 * 카드 key 에 해당하는 회차만 남긴다. key 가 없거나 맞는 회차가 없으면 전부 둔다.
 * 이미 공유된 예전 링크(`?category=samsung`, `other:26`)가 빈 화면이 되지 않게 한다
 */
export const filterBySeries = (
  programs: Program[],
  key: string | undefined,
) => {
  if (!key) return programs;
  const matched = programs.filter(
    (program) => getSeriesName(program.title) === key,
  );
  return matched.length > 0 ? matched : programs;
};

/** 회차 줄의 이름표. "N회차"가 있으면 그것을, 없으면 "신청" */
export const getSessionLabel = (title: string) => {
  const round = title.match(/(\d+)\s*회차/);
  return round ? `${round[1]}회차` : '신청';
};
