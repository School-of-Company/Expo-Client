import { ApplicationType } from '@/shared/types/exhibition/type';
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
    informationText: data.informationText,
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
  registrationType: ApplicationType,
) => {
  return {
    informationText: data.informationText,
    participantType: type,
    registrationType,
    dynamicForm: data.questions.map((question) => ({
      title: question.title,
      formType: question.formType,
      jsonData: convertOptionsToJson(question.options),
      requiredStatus: question.requiredStatus,
      otherJson: question.otherJson,
    })),
  };
};

export const transformFormData = (
  data: FormValues,
  type: 'STANDARD' | 'TRAINEE',
  mode: 'application' | 'survey',
  applicationType: ApplicationType,
): CreateFormRequest => {
  if (mode === 'survey') {
    return getSurveyRequestData(data, type);
  }

  return getApplicationRequestData(data, type, applicationType);
};
