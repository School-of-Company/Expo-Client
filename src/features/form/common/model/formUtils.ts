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

const mapRegistrationType = (
  applicationType: 'register' | 'onsite',
): 'PRE' | 'SITE' => {
  return applicationType === 'register' ? 'PRE' : 'SITE';
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
  registrationType: 'PRE' | 'SITE',
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
  applicationType?: 'register' | 'onsite',
): CreateFormRequest => {
  if (mode === 'survey') {
    return getSurveyRequestData(data, type);
  }

  const registrationType = applicationType
    ? mapRegistrationType(applicationType)
    : 'PRE';

  return getApplicationRequestData(data, type, registrationType);
};
