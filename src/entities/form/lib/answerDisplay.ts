import {
  OCCUPATION_OPTIONS,
  REGION_OPTIONS,
} from '../constants/occupationData';

/** 접수 당시 문항 중 표시에 쓰는 부분. 저장 계약은 폼의 DynamicFormItem(id·title·formType·jsonData·otherJson)이다 */
interface SnapshotQuestion {
  id: string;
  title: string;
  formType: string;
  options: Record<string, string>;
  hasEtc: boolean;
}

export interface AnswerRow {
  /** 문항 ID(답변 키) */
  id: string;
  label: string;
  /** 줄바꿈(\n)으로 나뉜 표시 문구 */
  text: string;
  /** 스냅샷에 이 문항이 없어 ID 로 대신 표시한 행 */
  questionMissing: boolean;
}

export interface AnswerDisplay {
  rows: AnswerRow[];
  /** questions 스냅샷이 없거나 읽을 수 없다 */
  snapshotMissing: boolean;
}

export const NO_ANSWER = '답변 없음';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const OCCUPATION_LABEL: Record<string, string> = Object.fromEntries(
  OCCUPATION_OPTIONS.map(({ key, label }) => [key, label]),
);
const REGION_LABEL: Record<string, string> = Object.fromEntries(
  REGION_OPTIONS.map(({ key, label }) => [key, label]),
);

/** 스냅샷은 문항 배열이거나 그 배열을 `dynamicForm` 으로 가진 객체로 온다 */
const readQuestions = (questions: unknown): SnapshotQuestion[] | null => {
  const list = Array.isArray(questions)
    ? questions
    : isRecord(questions) && Array.isArray(questions.dynamicForm)
      ? questions.dynamicForm
      : null;
  if (!list) return null;
  return list.flatMap((raw): SnapshotQuestion[] => {
    if (!isRecord(raw) || raw.id == null || typeof raw.title !== 'string')
      return [];
    const options = Object.fromEntries(
      Object.entries(isRecord(raw.jsonData) ? raw.jsonData : {}).flatMap(
        ([key, opt]) => {
          const label = isRecord(opt) ? opt.value : opt;
          return typeof label === 'string' ? [[key, label]] : [];
        },
      ),
    );
    return [
      {
        id: String(raw.id),
        title: raw.title,
        formType: String(raw.formType ?? ''),
        options,
        hasEtc: isRecord(raw.otherJson) && raw.otherJson.hasEtc === true,
      },
    ];
  });
};

const option = (question: SnapshotQuestion | undefined, key: string) => {
  if (!question) return key;
  const label = question.options[key];
  if (label !== undefined) return label;
  // 기타 선택은 키 자리에 입력한 문구가 그대로 저장된다
  return question.hasEtc ? `기타: ${key}` : `${key} (당시 선택지 정보 없음)`;
};

const companionText = (value: Record<string, unknown>) => {
  const str = (v: unknown) => (typeof v === 'string' ? v : '');
  const occupation = str(value.occupation);
  const region = str(value.region);
  const detail = [
    OCCUPATION_LABEL[occupation] ?? occupation,
    REGION_LABEL[region] ?? region,
    str(value.school),
  ].filter(Boolean);
  const name = str(value.name) || '(이름 없음)';
  return detail.length > 0 ? `${name} (${detail.join(' · ')})` : name;
};

/** 문항 종류를 모를 때의 읽을 수 있는 변환. JSON 문자열을 만들지 않는다 */
const plainText = (value: unknown): string => {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'boolean') return value ? '예' : '아니오';
  if (typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map(plainText).join('\n');
  if (isRecord(value))
    return Object.entries(value)
      .map(([key, v]) => `${key}: ${plainText(v)}`)
      .join(', ');
  return String(value);
};

const toText = (question: SnapshotQuestion | undefined, value: unknown) => {
  if (value == null || value === '') return NO_ANSWER;
  if (typeof value === 'boolean') return value ? '예' : '아니오';
  if (Array.isArray(value)) {
    if (value.length === 0) return NO_ANSWER;
    return value
      .map((item) =>
        isRecord(item)
          ? companionText(item)
          : typeof item === 'string' && question?.formType !== 'COMPANION'
            ? option(question, item)
            : plainText(item),
      )
      .join('\n');
  }
  if (typeof value === 'string') {
    if (question?.formType === 'REGION') return REGION_LABEL[value] ?? value;
    if (question?.formType === 'OCCUPATION')
      return OCCUPATION_LABEL[value] ?? value;
    if (question?.formType === 'DROPDOWN') return option(question, value);
    // 문항을 모르면 참가 유형·지역 키(GENERAL·GWANGJU 등)만 표시 이름으로 바꾼다
    if (!question)
      return OCCUPATION_LABEL[value] ?? REGION_LABEL[value] ?? value;
    return value;
  }
  return plainText(value);
};

/**
 * 접수 당시 questions 스냅샷으로 답변(문항 ID → 값)을 사람이 읽는 행으로 바꾼다.
 * 문항 ID 는 문항명으로, 선택지 키는 당시 선택지 라벨로 바꾸고, 스냅샷에 없는 항목은 지우지 않고 ID·원문으로 보여 준다.
 * 사용자·관리자 화면이 같이 쓴다.
 */
export const toAnswerDisplay = (
  questions: unknown,
  answers: unknown,
): AnswerDisplay => {
  const list = readQuestions(questions);
  const answerMap = isRecord(answers) ? answers : {};
  const used = new Set<string>();
  const rows: AnswerRow[] = [];

  // 문항 순서대로. 답하지 않은 문항도 "답변 없음"으로 남긴다
  for (const question of list ?? []) {
    used.add(question.id);
    rows.push({
      id: question.id,
      label: question.title,
      text: toText(question, answerMap[question.id]),
      questionMissing: false,
    });
  }
  // 스냅샷에 없는 키는 현재 폼으로 덮어쓰지 않고 ID 로 남긴다. "이름"처럼 문항명이 키인 답변은 키를 그대로 라벨로 쓴다
  for (const [id, value] of Object.entries(answerMap)) {
    if (used.has(id)) continue;
    rows.push({
      id,
      label: /^\d+$/.test(id) ? `문항 ${id}` : id,
      text: toText(undefined, value),
      questionMissing: true,
    });
  }
  return { rows, snapshotMissing: list === null };
};
