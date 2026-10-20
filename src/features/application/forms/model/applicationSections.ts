import type { Program } from '@/shared/types/program/list/type';

/**
 * 신청 목록을 사전등록 / 프로그램 신청 / 교원연수 신청 세 덩어리로 보여 줄 때의 묶음 기준.
 * 서버 groupId 는 회차를 묶는 값이라 연수사·골든벨 부문처럼 사람이 보는 분류와 다르다
 * (교원연수는 회차마다 groupId 가 달라 제목으로만 연수사를 알 수 있다). 그래서 제목의 키워드로 묶고,
 * 어느 쪽에도 안 맞는 프로그램은 제목 그대로 독립 카드로 둔다.
 */
export interface SectionCategory {
  key: string;
  label: string;
  /** 서버에 장소가 없을 때 대신 보여 줄 장소 */
  place?: string;
  match: RegExp;
}

export const PROGRAM_CATEGORIES: SectionCategory[] = [
  {
    key: 'keynote',
    label: '기조강연',
    match: /기조/,
  },
  {
    key: 'goldenbell',
    label: 'AI·SW 골든벨',
    match: /골든벨/,
  },
  {
    key: 'tour',
    label: 'AI교육원 전시체험 투어',
    match: /전시체험|투어/,
  },
];

export const TRAINING_CATEGORIES: SectionCategory[] = [
  {
    key: 'samsung',
    label: '삼성 연수',
    match: /삼성/,
  },
  {
    key: 'google',
    label: '구글 연수',
    match: /구글/,
  },
  {
    key: 'apple',
    label: '애플 연수',
    place: '202호',
    match: /애플/,
  },
];

export interface CategoryGroup {
  key: string;
  label: string;
  place?: string;
  sessions: Program[];
}

const byStart = (a: Program, b: Program) =>
  a.startedAt.localeCompare(b.startedAt) || a.id - b.id;

/**
 * 프로그램을 분류별 카드로 묶는다. 분류 순서는 categories 순서이고, 분류에 안 맞는 프로그램은 뒤에
 * 제목 그대로 한 장씩 둔다. 비어 있는 분류는 만들지 않는다
 */
export const groupByCategory = (
  programs: Program[],
  categories: SectionCategory[],
): CategoryGroup[] => {
  const known = categories.map((category) => ({
    ...category,
    sessions: [] as Program[],
  }));
  const others: CategoryGroup[] = [];
  [...programs].sort(byStart).forEach((program) => {
    const group = known.find((candidate) =>
      candidate.match.test(program.title),
    );
    if (group) group.sessions.push(program);
    else
      others.push({
        key: `other:${program.id}`,
        label: program.title,
        sessions: [program],
      });
  });
  return [...known.filter((group) => group.sessions.length > 0), ...others];
};

/** 카드의 key(삼성은 samsung, 분류에 안 맞는 건 other:프로그램 id)에 해당하는 프로그램만 남긴다. key 가 없으면 전부 둔다 */
export const filterByCategory = (
  programs: Program[],
  categories: SectionCategory[],
  key: string | undefined,
) => {
  if (!key) return programs;
  const category = categories.find((candidate) => candidate.key === key);
  return programs.filter((program) =>
    category
      ? category.match.test(program.title)
      : key === `other:${program.id}`,
  );
};

const compact = (value: string) => value.replace(/[\s·]/g, '');

/** 회차 줄의 이름표. "N회차"가 있으면 그것을, 없으면 분류 이름을 뺀 제목(초등, 중·고등 등)을 쓴다 */
export const getSessionLabel = (title: string, categoryLabel: string) => {
  const round = title.match(/(\d+)\s*회차/);
  if (round) return `${round[1]}회차`;
  const rest = compact(title)
    .replace(/골든벨/g, '')
    .replace(compact(categoryLabel), '')
    .replace(/[()]/g, '');
  // 띄어쓰기를 걷은 값이라 "중·고등"처럼 원래 제목의 표기를 그대로 돌려준다
  return rest
    ? title
        .replace(/골든벨/g, '')
        .replace(/[()]/g, '')
        .trim()
    : '신청';
};

/**
 * 회차 줄에 덧붙이는 주제. 연수는 "삼성 연수 2회차 · 주제", "(삼성 1회차) 주제" 꼴이라 주제만 남기고,
 * 분류 이름과 같아지는 제목(기조 강연, 투어 N회차)은 반복이라 비운다
 */
export const getSessionTopic = (title: string, categoryLabel: string) => {
  const afterDot = title.includes('·')
    ? title.slice(title.indexOf('·') + 1)
    : title;
  const topic = afterDot
    .replace(/^\s*\([^)]*\)\s*/, '')
    .replace(/\(\s*\d+\s*회차\s*\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!topic || compact(categoryLabel).includes(compact(topic))) return '';
  // 골든벨 부문명처럼 이름표가 이미 말해 주는 제목은 반복하지 않는다
  if (/골든벨/.test(categoryLabel) && /골든벨/.test(topic)) return '';
  return topic;
};
