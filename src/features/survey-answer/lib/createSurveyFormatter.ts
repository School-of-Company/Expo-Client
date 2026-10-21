import { buildSurveyAnswers } from '@/features/application/lib/process/buildSurveyAnswers';
import {
  DynamicFormItem,
  DynamicFormValues,
  FormattedSurveyData,
} from '@/shared/types/application/type';

// 응답자는 서버가 참가자 세션으로 정하므로 전화번호는 보내지 않는다.
export const createSurveyFormatter = (
  dynamicFormItems: DynamicFormItem[],
): ((
  data: DynamicFormValues & { privacyConsent: boolean },
) => FormattedSurveyData) => {
  return ({ privacyConsent, ...data }) => ({
    personalInformationStatus: privacyConsent,
    answers: buildSurveyAnswers(data, dynamicFormItems),
  });
};
