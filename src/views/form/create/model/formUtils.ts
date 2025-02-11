import { FormValues, CreateFormRequest } from '@/shared/types/form/create/type';

export const getParticipantOrType = (
  navigation?: string | null,
): 'STANDARD' | 'TRAINEE' => {
  return ['standard_application', 'standard_survey'].includes(navigation || '')
    ? 'STANDARD'
    : 'TRAINEE';
};

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
  participantOrType: 'STANDARD' | 'TRAINEE',
) => {
  return {
    participationType: participantOrType,
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
  participantOrType: 'STANDARD' | 'TRAINEE',
) => {
  return {
    participantType: participantOrType,
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
  navigation?: string | null,
): CreateFormRequest => {
  const isSurvey =
    navigation === 'standard_survey' || navigation === 'trainee_survey';
  const participantOrType = getParticipantOrType(navigation);

  return isSurvey
    ? getSurveyRequestData(data, participantOrType)
    : getApplicationRequestData(data, participantOrType);
};
