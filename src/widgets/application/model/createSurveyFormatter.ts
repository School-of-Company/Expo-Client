import {
  DynamicFormItem,
  DynamicFormValues,
  FormattedSurveyData,
} from '@/shared/types/application/type';
import { processDynamicFormData } from './processDynamicFormData';

export const createSurveyFormatter = (
  dynamicFormItems: DynamicFormItem[],
): ((
  data: DynamicFormValues & { privacyConsent: boolean },
) => FormattedSurveyData) => {
  return (data) => ({
    phoneNumber: String(data['휴대폰 번호를 입력하세요'] || ''),
    answerJson: JSON.stringify(processDynamicFormData(data, dynamicFormItems)),
    personalInformationStatus: data.privacyConsent,
  });
};
