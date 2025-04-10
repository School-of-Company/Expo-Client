import { FormValues, Option } from '@/shared/types/form/create/type';

interface ApplicationFormData {
  informationText: string;
  participantType: 'STANDARD' | 'TRAINEE';
  dynamicForm: ServerFormItem[];
}

interface SurveyFormData {
  informationText: string;
  participationType: 'STANDARD' | 'TRAINEE';
  dynamicSurveyResponseDto: ServerFormItem[];
}

interface ServerFormItem {
  title: string;
  formType: string;
  jsonData: string;
  requiredStatus: boolean;
  otherJson: string | null;
}

type ServerFormData = ApplicationFormData | SurveyFormData;

export const transformServerData = (
  data: ServerFormData,
  mode: 'application' | 'survey',
): FormValues => {
  const formItems =
    mode === 'application'
      ? (data as ApplicationFormData).dynamicForm
      : (data as SurveyFormData).dynamicSurveyResponseDto;

  const informationText =
    mode === 'application'
      ? (data as ApplicationFormData).informationText
      : (data as SurveyFormData).informationText;

  if (!formItems) {
    return { informationText, questions: [] };
  }

  return {
    informationText,
    questions: formItems.map((item) => ({
      title: item.title,
      formType: item.formType,
      options: Object.entries(JSON.parse(item.jsonData || '{}')).map(
        ([_key, value]): Option => ({
          value: value as string,
          label: value as string,
        }),
      ),
      requiredStatus: item.requiredStatus,
      otherJson: item.otherJson,
    })),
  };
};
