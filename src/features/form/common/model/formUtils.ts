import type { JsonData, OtherJson } from '@/shared/types/application/type';
import type { ApplicationType } from '@/shared/types/exhibition/type';
import type {
  FormValues,
  CreateFormRequest,
  ConditionalSettings,
  DynamicFieldRequest,
  Option,
} from '@/shared/types/form/create/type';

type Question = FormValues['questions'][number];

const NO_OPTION_TYPES = ['SENTENCE', 'CHECKBOX', 'IMAGE'];

export const optionKey = (option: Option, index: number) =>
  option.key ?? String(index + 1);

const toJsonData = (question: Question): JsonData =>
  NO_OPTION_TYPES.includes(question.formType)
    ? {}
    : Object.fromEntries(
        question.options.map((option, index) => [
          optionKey(option, index),
          option.isAlwaysSelected
            ? { value: option.value, isAlwaysSelected: true }
            : option.value,
        ]),
      );

export const parseSettings = (
  otherJson: string | null,
): ConditionalSettings => {
  if (!otherJson) return {};
  try {
    return JSON.parse(otherJson);
  } catch {
    return {};
  }
};

/** 빌더 내부의 UUID 참조(부모 문항·선택지)를 서버의 위치·키 참조로 바꾼다. */
const toOtherJson = (
  question: Question,
  questions: Question[],
): OtherJson | null => {
  const { maxSelection, conditional } = parseSettings(question.otherJson);
  const parentIndex = conditional
    ? questions.findIndex((q) => q.id === conditional.parentId)
    : -1;
  const parent = questions[parentIndex];
  const keyOf = (optionId: string) => {
    const index = parent.options.findIndex((o) => o.id === optionId);
    return index === -1 ? optionId : optionKey(parent.options[index], index);
  };

  let serverConditional: OtherJson['conditional'];
  if (parent && conditional?.triggerValues?.length) {
    serverConditional = {
      parentIndex,
      triggerValues: conditional.triggerValues.map(keyOf),
    };
  } else if (parent && conditional?.triggerValue) {
    serverConditional = {
      parentIndex,
      triggerValue: keyOf(conditional.triggerValue),
    };
  }

  if (!maxSelection && !serverConditional) return null;
  return {
    hasEtc: false,
    ...(maxSelection && { maxSelection }),
    ...(serverConditional && { conditional: serverConditional }),
  };
};

const toFields = (data: FormValues) => {
  const questions = data.questions.filter(
    (question) => question.formType !== 'PRIVACYCONSENT',
  );

  return questions.map((question) => ({
    title: question.title,
    formType: question.formType as DynamicFieldRequest['formType'],
    jsonData: toJsonData(question),
    requiredStatus: question.requiredStatus,
    otherJson: toOtherJson(question, questions),
    dynamicFormType: question.dynamicFormType || 'DEFAULT',
  }));
};

export const transformFormData = (
  data: FormValues,
  type: 'STANDARD' | 'TRAINEE',
  mode: 'application' | 'survey',
  applicationType: ApplicationType,
  startDate: string,
  endDate: string,
): CreateFormRequest => {
  const common = {
    title: data.title,
    informationText: data.informationText || '',
  };

  if (mode === 'survey') {
    return {
      ...common,
      participationType: type,
      dynamicSurveyRequestDto: toFields(data).map(
        ({ dynamicFormType: _, ...field }) => field,
      ),
    };
  }

  return {
    ...common,
    participantType: type,
    applicationType,
    startDate,
    endDate,
    dynamicForm: toFields(data),
  };
};
