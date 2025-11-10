import { ApplicationType } from '@/shared/types/exhibition/type';
import { FormValues, CreateFormRequest } from '@/shared/types/form/create/type';

const convertOptionsToJson = (
  options: { value: string; isAlwaysSelected?: boolean }[],
): string => {
  return JSON.stringify(
    options.reduce(
      (acc, option, index) => {
        acc[(index + 1).toString()] = option.isAlwaysSelected
          ? { value: option.value, isAlwaysSelected: true }
          : option.value;
        return acc;
      },
      {} as Record<
        string,
        string | { value: string; isAlwaysSelected: boolean }
      >,
    ),
  );
};

const getSurveyRequestData = (
  data: FormValues,
  type: 'STANDARD' | 'TRAINEE',
  startDate: string,
  endDate: string,
) => {
  const filteredQuestions = data.questions.filter(
    (question) => question.formType !== 'PRIVACYCONSENT',
  );

  return {
    title: data.title,
    informationText: data.informationText || '',
    participationType: type,
    startDate,
    endDate,
    dynamicSurveyRequestDto: filteredQuestions.map((question) => ({
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
  applicationType: ApplicationType,
  applicationId: string,
  startDate: string,
  endDate: string,
) => {
  const filteredQuestions = data.questions.filter(
    (question) => question.formType !== 'PRIVACYCONSENT',
  );

  return {
    applicationId,
    title: data.title,
    informationText: data.informationText || '',
    participantType: type,
    applicationType,
    startDate,
    endDate,
    dynamicForm: filteredQuestions.map((question) => ({
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
  applicationId: string,
  startDate: string,
  endDate: string,
): CreateFormRequest => {
  if (mode === 'survey') {
    return getSurveyRequestData(data, type, startDate, endDate);
  }

  return getApplicationRequestData(
    data,
    type,
    applicationType,
    applicationId,
    startDate,
    endDate,
  );
};
