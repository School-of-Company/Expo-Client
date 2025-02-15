import { FormValues, CreateFormRequest } from '@/shared/types/form/create/type';

const convertOptionsToJson = (options: { value: string }[]): string => {
  return JSON.stringify(
    options.reduce(
      (acc, option, index) => {
        acc[(index + 1).toString()] = option.value;
        return acc;
      },
      {} as Record<string, string>,
    ),
  );
};

const getSurveyRequestData = (
  data: FormValues,
  type: 'STANDARD' | 'TRAINEE',
) => {
  return {
    participationType: type,
    dynamicSurveyRequestDto: data.questions.map((question) => ({
      title: question.title,
      formType: question.formType,
      jsonData: convertOptionsToJson(question.options),
      requiredStatus: question.requiredStatus,
      otherJson: question.otherJson,
    })),
  };
};

const getApplicationRequestData = (
  data: FormValues,
  type: 'STANDARD' | 'TRAINEE',
) => {
  return {
    participantType: type,
    dynamicForm: data.questions.map((question) => ({
      title: question.title,
      formType: question.formType,
      jsonData: convertOptionsToJson(question.options),
      requiredStatus: question.requiredStatus,
      otherJson: question.otherJson,
    })),
    informationImage: '',
  };
};

export const transformFormData = (
  data: FormValues,
  type: 'STANDARD' | 'TRAINEE',
  mode: 'application' | 'survey',
): CreateFormRequest => {
  return mode === 'survey'
    ? getSurveyRequestData(data, type)
    : getApplicationRequestData(data, type);
};
