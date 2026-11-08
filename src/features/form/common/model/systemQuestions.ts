import {
  OCCUPATION_OPTIONS,
  SCHOOL_OCCUPATIONS,
} from '@/entities/form/constants/occupationData';
import type { FormValues } from '@/shared/types/form/create/type';

type Question = FormValues['questions'][number];

/**
 * 일반 참가자 신청 폼에 꼭 있어야 하는 항목. 빠지면 신청 서버가 모든 신청을 거절하거나(직업·소속 학교·전화번호),
 * 참가자가 내용 없는 동의를 하게 된다(안내문). Form 서버 검증(Expo-Form-Server#279)과 같은 규칙이다
 */
export type SystemField =
  | 'NAME'
  | 'PHONE_NUMBER'
  | 'OCCUPATION'
  | 'SCHOOL'
  | 'INFORMATION_TEXT';

export const SYSTEM_FIELD_LABEL: Record<SystemField, string> = {
  NAME: '이름',
  PHONE_NUMBER: '전화번호',
  OCCUPATION: '직업',
  SCHOOL: '소속 학교',
  INFORMATION_TEXT: '개인정보 동의 안내문',
};

const SYSTEM_QUESTION_TYPES = [
  'NAME',
  'PHONE_NUMBER',
  'OCCUPATION',
  'SCHOOL',
] as const;

/** 일반 참가자 신청 폼만 시스템 항목을 강제한다. 연수자 폼과 설문은 지금 규칙을 둔다 */
export const requiresSystemFields = (
  type: 'STANDARD' | 'TRAINEE',
  mode: 'application' | 'survey',
) => type === 'STANDARD' && mode === 'application';

/** 삭제할 수 없고 필수로 고정되는 문항인지 */
export const isSystemQuestionType = (dynamicFormType?: string) =>
  SYSTEM_QUESTION_TYPES.some((value) => value === dynamicFormType);

const newId = () => crypto.randomUUID();

const sentence = (
  dynamicFormType: Question['dynamicFormType'],
  title: string,
): Question => ({
  id: newId(),
  title,
  formType: 'SENTENCE',
  options: [],
  requiredStatus: true,
  otherJson: null,
  dynamicFormType,
});

const occupationQuestion = (): Question => ({
  ...sentence('OCCUPATION', SYSTEM_FIELD_LABEL.OCCUPATION),
  formType: 'DROPDOWN',
  options: OCCUPATION_OPTIONS.map(({ key, label }) => ({
    id: newId(),
    key,
    value: label,
  })),
});

/** 직업이 교사·예비교사일 때만 보이는 소속 학교 문항. FormEditor 의 특수 필드 추가와 같은 모양이다 */
export const schoolQuestion = (occupation: Question): Question => ({
  ...sentence('SCHOOL', SYSTEM_FIELD_LABEL.SCHOOL),
  otherJson: JSON.stringify({
    conditional: {
      parentId: occupation.id,
      triggerValues: occupation.options
        .filter((option) =>
          SCHOOL_OCCUPATIONS.some((occupation) => occupation === option.key),
        )
        .map((option) => option.id),
    },
  }),
});

const has = (questions: Question[], dynamicFormType: string) =>
  questions.some((question) => question.dynamicFormType === dynamicFormType);

/** 빠진 시스템 항목. 화면에 보이는 순서(이름 → 전화번호 → 직업 → 소속 학교 → 안내문)다 */
export const findMissingSystemFields = ({
  questions,
  informationText,
}: Pick<FormValues, 'questions' | 'informationText'>): SystemField[] => [
  ...SYSTEM_QUESTION_TYPES.filter((value) => !has(questions, value)),
  ...(informationText?.trim() ? [] : (['INFORMATION_TEXT'] as const)),
];

/** 빠진 시스템 문항을 만든다. 소속 학교는 이미 있는 직업 문항(없으면 새로 만든 직업 문항)에 조건을 건다 */
export const buildMissingSystemQuestions = (
  questions: Question[],
): Question[] => {
  const added: Question[] = [];
  if (!has(questions, 'NAME')) {
    added.push(sentence('NAME', SYSTEM_FIELD_LABEL.NAME));
  }
  if (!has(questions, 'PHONE_NUMBER')) {
    added.push(sentence('PHONE_NUMBER', SYSTEM_FIELD_LABEL.PHONE_NUMBER));
  }
  let occupation = questions.find(
    (question) => question.dynamicFormType === 'OCCUPATION',
  );
  if (!occupation) {
    occupation = occupationQuestion();
    added.push(occupation);
  }
  if (!has(questions, 'SCHOOL')) added.push(schoolQuestion(occupation));
  return added;
};

/** 새 일반 참가자 신청 폼의 기본 문항 */
export const createSystemQuestions = () => buildMissingSystemQuestions([]);
