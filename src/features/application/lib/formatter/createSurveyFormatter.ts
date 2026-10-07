import {
  DynamicFormItem,
  DynamicFormValues,
  FormattedSurveyData,
} from '@/shared/types/application/type';
import { buildSurveyAnswers } from '../process/buildSurveyAnswers';

// 설문 문항에는 dynamicFormType이 없어서 전화번호는 본인 인증 뒤 붙는 쿼리로만 받는다.
export const createSurveyFormatter = (
  dynamicFormItems: DynamicFormItem[],
  queryPhoneNumber?: string | null,
): ((
  data: DynamicFormValues & { privacyConsent: boolean },
) => FormattedSurveyData) => {
  return ({ privacyConsent, ...data }) => ({
    phoneNumber: queryPhoneNumber ?? '',
    personalInformationStatus: privacyConsent,
    answers: buildSurveyAnswers(data, dynamicFormItems),
  });
};
