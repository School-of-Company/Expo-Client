import {
  DynamicFormItem,
  DynamicFormValues,
} from '@/shared/types/application/type';
import { processDynamicFormData } from './processDynamicFormData';
import { SurveyData } from './usePostApplication';

export const createSurveyFormatter = (dynamicFormItems: DynamicFormItem[]) => {
  return (data: DynamicFormValues): SurveyData => ({
    phoneNumber: String(data['휴대폰 번호를 입력하세요'] || ''),
    answerJson: JSON.stringify(processDynamicFormData(data, dynamicFormItems)),
  });
};
